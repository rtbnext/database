import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IProfile } from '@/interfaces/profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';
import deepmerge from 'deepmerge';
import { join } from 'node:path';

export class Profile implements IProfile {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ProfileIndex.getInstance();

    private uri: string;
    private path: string;
    private item: TProfileIndexItem;
    private data?: TProfileData;
    private history?: TProfileHistory;
    private meta: TMetaData[ '@metadata' ];

    private constructor ( item?: TProfileIndexItem ) {
        if ( ! item ) throw new Error( `Profile index item not given` );

        this.uri = item.uri;
        this.path = join( 'profile', item.uri );
        this.item = item;

        Profile.storage.ensurePath( this.path, true );
        this.meta = ( Profile.storage.readJSON< TMetaData >(
            this.resolvePath( 'meta.json' )
        ) || Utils.metaData() )[ '@metadata' ];
    }

    // Private helper

    private resolvePath ( path: string ) : string {
        return join( this.path, path );
    }

    private touch () : void {
        this.meta.lastModified = new Date().toISOString();
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

    public getItem () : TProfileIndexItem {
        return this.item;
    }

    public getMeta () : TMetaData[ '@metadata' ] {
        return this.meta;
    }

    public schemaVersion () : number {
        return this.meta.schemaVersion;
    }

    public modified () : string {
        return this.meta.lastModified;
    }

    public modifiedTime () : number {
        return new Date( this.meta.lastModified ).getTime();
    }

    // Manage profile data

    public getData () : TProfileData {
        return this.data ||= Profile.storage.readJSON< TProfileData >(
            join( this.path, 'profile.json' )
        ) || {} as TProfileData;
    }

    public setData (
        data: TProfileData, aliases?: string[],
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void {
        this.data = data;
        this.updateIndex( aliases, aliasMode );
        this.touch();
    }

    public updateData (
        data: Partial< TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace',
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void {
        this.data = deepmerge< TProfileData >( this.getData(), data, {
            arrayMerge: ( t, s ) => Utils.mergeArray( t, s, mode )
        } );
        this.updateIndex( aliases, aliasMode );
        this.touch();
    }

    // Manage profile history data

    public getHistory () : TProfileHistory {
        return this.history ||= Profile.storage.readCSV< TProfileHistory >(
            join( this.path, 'history.csv' )
        ) || [] as TProfileHistory;
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

}
