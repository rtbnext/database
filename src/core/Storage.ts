import { Config } from '@/core/Config';
import { TStorageConfig } from '@/types/config';
import { extname, join } from 'node:path';

export class Storage {

    private static instance: Storage;

    private readonly config: TStorageConfig;
    private readonly path: string;

    private constructor () {
        const { root, storage } = Config.getInstance();
        this.config = storage;
        this.path = join( root, this.config.baseDir );
    }

    private resolvePath ( path: string ) : string {
        return path.includes( this.path ) ? path : join( this.path, path );
    }

    private fileExt ( path: string ) : string {
        return extname( this.resolvePath( path ) ).toLowerCase().replace( '.', '' );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
