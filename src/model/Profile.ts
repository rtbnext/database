import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IProfile } from '@/interfaces/profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData, TProfileHistory, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';
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

    // Basic getters

    public getUri () : string {
        return this.uri;
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

}
