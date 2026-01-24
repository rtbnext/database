import { join } from 'node:path';

import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import * as P from '@rtbnext/schema/src/model/profile';
import deepmerge from 'deepmerge';

import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IProfile } from '@/interfaces/profile';
import { ProfileIndex } from '@/model/ProfileIndex';

export class Profile implements IProfile {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ProfileIndex.getInstance();

    private uri: string;
    private path: string;
    private item: P.TProfileIndexItem;
    private data?: P.TProfileData;
    private history?: P.TProfileHistory;
    private meta: TMetaData;

    private constructor ( item?: P.TProfileIndexItem ) {
        if ( ! item ) throw new Error( `Profile index item not given` );

        this.uri = item.uri;
        this.path = join( 'profile', item.uri );
        this.item = item;

        Profile.storage.ensurePath( this.path, true );
        this.meta = Profile.storage.readJSON< TMetaData >(
            this.resolvePath( 'meta.json' )
        ) || Utils.metaData();
    }

    // Private helper

    private resolvePath ( path: string ) : string {
        return join( this.path, path );
    }

    private touch () : void {
        this.meta[ '@metadata' ].lastModified = new Date().toISOString();
    }

    private updateIndex ( aliases: string[] = [], mode: 'replace' | 'unique' = 'unique' ) : void {
        const {
            uri, info: { shortName: name }, bio: { cv },
            wiki: { desc, image: { file, thumb } = {} } = {}
        } = this.getData();

        this.item = {
            uri, name, desc, image: thumb ?? file,
            aliases: Utils.mergeArray( this.item.aliases, aliases, mode ),
            text: Utils.buildSearchText( cv )
        };
    }

    // Basic getters

    public getUri () : string {
        return this.uri;
    }

    public getItem () : P.TProfileIndexItem {
        return this.item;
    }

    public getMeta () : TMetaData[ '@metadata' ] {
        return this.meta[ '@metadata' ];
    }

    public schemaVersion () : number {
        return this.meta[ '@metadata' ].schemaVersion;
    }

    public modified () : string {
        return this.meta[ '@metadata' ].lastModified;
    }

    public modifiedTime () : number {
        return new Date( this.meta[ '@metadata' ].lastModified ).getTime();
    }

    // Verify profile

    public verify ( id: string ) : boolean {
        return Utils.verifyHash( id, this.getData().id );
    }

    // Manage profile data

    public getData () : P.TProfileData {
        return this.data ||= Profile.storage.readJSON< P.TProfileData >(
            join( this.path, 'profile.json' )
        ) || {} as P.TProfileData;
    }

    public setData (
        data: P.TProfileData, aliases?: string[],
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void {
        this.data = data;
        this.updateIndex( aliases, aliasMode );
        this.touch();
    }

    public updateData (
        data: Partial< P.TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace',
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void {
        this.data = deepmerge< P.TProfileData >( this.getData(), data, {
            arrayMerge: ( t, s ) => Utils.mergeArray( t, s, mode )
        } );
        this.updateIndex( aliases, aliasMode );
        this.touch();
    }

    // Manage profile history data

    public getHistory () : P.TProfileHistory {
        return this.history ||= Profile.storage.readCSV< P.TProfileHistory >(
            join( this.path, 'history.csv' )
        ) || [] as P.TProfileHistory;
    }

    public setHistory ( history: P.TProfileHistory ) : void {
        this.history = history;
        this.touch();
    }

    public addHistory ( row: P.TProfileHistoryItem ) : void {
        this.history = [ ...this.getHistory(), row ];
        this.touch();
    }

    public mergeHistory ( history: P.TProfileHistory ) : void {
        this.history = Array.from(
            new Map( [ ...this.getHistory(), ...history ].map( i => [ i[ 0 ], i ] ) ).values()
        ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );
        this.touch();
    }

    // Save profile data

    public save () : void {
        log.debug( `Saving profile: ${this.uri}` );
        log.catch( () => {
            if ( ! Profile.index.update( this.uri, this.item ) ) {
                throw new Error( `Failed to update profile index` );
            }

            if ( this.data && ! Profile.storage.writeJSON< P.TProfileData >(
                this.resolvePath( 'profile.json' ), this.data
            ) ) throw new Error( `Failed to write profile data` );

            if ( this.history && ! Profile.storage.writeCSV< P.TProfileHistory >(
                this.resolvePath( 'history.csv' ), this.history
            ) ) throw new Error( `Failed to write profile history` );

            if ( this.meta && ! Profile.storage.writeJSON< TMetaData >(
                this.resolvePath( 'meta.json' ), this.meta
            ) ) throw new Error( `Failed to write profile metadata` );
        }, `Failed to save profile: ${this.uri}` );
    }

    // Move profile

    public move ( uriLike: string, makeAlias: boolean = true ) : boolean {
        const uri = Utils.sanitize( uriLike );
        log.debug( `Moving profile: ${this.uri} -> ${uri}` );

        return log.catch( () => {
            const item = Profile.index.move( this.uri, uri, makeAlias );
            if ( ! item ) throw new Error( `Failed to move profile index item` );

            const oldPath = this.path;
            this.uri = uri;
            this.path = join( 'profile', uri );
            this.item = item;

            if ( ! Profile.storage.move( oldPath, this.path ) ) {
                throw new Error( `Failed to move profile storage` );
            }

            this.updateData( { uri: uri } );
            this.save();
            return true;
        }, `Failed to move profile: ${this.uri} -> ${uri}` ) ?? false;
    }

    // Instantiate

    public static get ( uriLike: string ) : Profile | false {
        return log.catch(
            () => new Profile( Profile.index.get( uriLike ) ),
            `Failed to get profile: ${uriLike}`
        ) ?? false;
    }

    public static getByItem ( item: P.TProfileIndexItem ) : Profile | false {
        return log.catch(
            () => new Profile( item ),
            `Failed to get profile by item: ${item.uri}`
        ) ?? false;
    }

    public static find ( uriLike: string ) : Profile | false {
        return log.catch(
            () => new Profile( Profile.index.find( uriLike ).values().next().value ),
            `Failed to find profile: ${uriLike}`
        ) ?? false;
    }

    // Create profile

    public static create (
        uriLike: string, data: P.TProfileData, history?: P.TProfileHistory, aliases: string[] = []
    ) : Profile | false {
        const uri = Utils.sanitize( uriLike );
        log.debug( `Creating profile: ${uri}` );

        return log.catch( () => {
            const item = Profile.index.add( uri, {
                uri, name: data.info.shortName ?? data.info.shortName, aliases,
                desc: data.wiki?.desc, image: data.wiki?.image?.thumb ?? data.wiki?.image?.file,
                text: Utils.buildSearchText( data.bio.cv )
            } );

            if ( ! item ) throw new Error( `Failed to add profile to index` );

            const profile = new Profile( item );
            profile.setData( { ...{
                info: {}, bio: {}, related: [], media: [], map: [],
                ranking: [], annual: [], assets: []
            }, ...data } );
            profile.setHistory( history ?? [] );
            profile.save();

            log.debug( `Profile created: ${uri}` );
            return profile;
        }, `Failed to create profile: ${uri}` ) ?? false;
    }

    // Delete profile

    public static delete ( uriLike: string ) : boolean {
        const uri = Utils.sanitize( uriLike );
        log.debug( `Deleting profile: ${uri}` );

        return log.catch( () => {
            const path = join( 'profile', uri );

            if ( ! Profile.storage.remove( path ) ) {
                throw new Error( `Failed to remove profile storage` );
            }

            Profile.index.delete( uri );

            log.debug( `Profile deleted: ${uri}` );
            return true;
        }, `Failed to delete profile: ${uri}` ) ?? false;
    }

}
