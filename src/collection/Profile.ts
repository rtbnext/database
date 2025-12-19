import { ProfileIndex } from '@/collection/ProfileIndex';
import { Storage } from '@/core/Storage';
import { TMetaData } from '@/types/generic';
import { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem } from '@/types/profile';
import { Utils } from '@/utils/Utils';
import { join } from 'node:path';
import deepmerge from 'deepmerge';

export class Profile {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ProfileIndex.getInstance();

    private uri: string;
    private path: string;
    private item: TProfileIndexItem;
    private data?: TProfileData;
    private history?: TProfileHistory;
    private meta: TMetaData;

    private constructor ( item?: TProfileIndexItem ) {
        if ( ! item ) throw new Error( `Profile index item not given` );

        this.uri = item.uri;
        this.path = join( 'profile', item.uri );
        this.item = item;

        this.meta = Profile.storage.readJSON< TMetaData >( join( this.path, 'meta.json' ) ) || {
            schemaVersion: 2, lastModified: new Date().toISOString()
        };
    }

    private touch () : void {
        this.meta!.lastModified = new Date().toISOString();
    }

    private updateIndex ( aliases: string[] = [] ) : void {
        if ( this.getData() ) this.item = {
            uri: this.uri, name: this.data!.info.name,
            aliases: Utils.mergeArray( this.item.aliases, aliases, 'unique' ),
            text: this.data!.bio.cv.join( ' ' )
        };
    }

    public verify ( id: string ) : boolean {
        return Utils.verifyHash( id, this.getData().id );
    }

    public getUri () : string {
        return this.uri;
    }

    public getMeta () : TMetaData {
        return this.meta;
    }

    public schemaVersion () : number {
        return this.meta.schemaVersion;
    }

    public modified () : string {
        return this.meta.lastModified;
    }

    public getData () : TProfileData {
        return this.data ||= Profile.storage.readJSON< TProfileData >(
            join( this.path, 'profile.json' )
        ) as TProfileData;
    }

    public setData ( data: TProfileData, aliases?: string[] ) : void {
        this.data = data;
        this.updateIndex( aliases );
        this.touch();
    }

    public updateData (
        data: Partial< TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace'
    ) : void {
        this.data = deepmerge< TProfileData >( this.getData(), data, {
            arrayMerge: ( t, s ) => Utils.mergeArray( t, s, mode )
        } );
        this.updateIndex( aliases );
        this.touch();
    }

    public getHistory () : TProfileHistory {
        return this.history ||= Profile.storage.readCSV< TProfileHistory >(
            join( this.path, 'history.csv' )
        ) as TProfileHistory;
    }

    public setHistory ( history: TProfileHistory ) : void {
        this.history = history;
        this.touch();
    }

    public addHistory ( row: TProfileHistoryItem ) : void {
        this.history = [ ...this.getHistory(), row ];
        this.touch();
    }

    public mergeHistory ( history: TProfileHistory ) : void {
        this.history = Array.from(
            new Map( [ ...this.getHistory(), ...history ].map( i => [ i[ 0 ], i ] ) ).values()
        ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );
        this.touch();
    }

    public save () : void {
        Profile.index.update( this.uri, this.item );
        Profile.storage.ensurePath( this.path );
        if ( this.data ) Profile.storage.writeJSON< TProfileData >( join( this.path, 'profile.json' ), this.data );
        if ( this.history ) Profile.storage.writeCSV< TProfileHistory >( join( this.path, 'history.csv' ), this.history );
        if ( this.meta ) Profile.storage.writeJSON< TMetaData >( join( this.path, 'meta.json' ), this.meta );
    }

    public move ( uriLike: string, makeAlias: boolean = true ) : boolean {
        const newUri = Utils.sanitize( uriLike );
        const item = Profile.index.move( this.uri, newUri, makeAlias );
        if ( ! item ) return false;

        const oldPath = this.path;
        this.uri = newUri;
        this.path = join( 'profile', newUri );
        this.item = item;
        Profile.storage.move( oldPath, this.path );

        this.updateData( { uri: newUri } );
        this.save();
        return true;
    }

    public static get ( uriLike: string ) : Profile | false {
        try { return new Profile( Profile.index.get( uriLike ) ) }
        catch { return false }
    }

    public static find ( uriLike: string ) : Profile | false {
        try { return new Profile( Profile.index.find( uriLike ).values().next().value ) }
        catch { return false }
    }

    public static create (
        uriLike: string, data: TProfileData, history?: TProfileHistory, aliases: string[] = []
    ) : Profile | false {
        const uri = Utils.sanitize( uriLike );
        const item = Profile.index.add( uri, { uri, name: data.info.name, aliases, text: data.bio.cv.join( ' ' ) } );
        if ( ! item ) return false;

        const profile = new Profile( item );
        profile.setData( data );
        profile.setHistory( history ?? [] );
        profile.save();

        return profile;
    }

    public static delete ( uriLike: string ) : boolean {
        const uri = Utils.sanitize( uriLike );
        const path = join( 'profile', uri );

        try {
            if ( ! Profile.storage.remove( path ) ) return false;
            Profile.index.delete( uri ); return true;
        } catch { return false }
    }

}
