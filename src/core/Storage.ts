import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { TStorageConfig } from '@/types/config';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { parse, stringify } from 'csv-string';

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

    private read ( path: string, type?: 'raw' | 'json' | 'csv' ) : any {
        return log.catch( () => {
            this.assertPath( path = this.resolvePath( path ) );
            const content = readFileSync( path, 'utf8' );
            switch ( type ?? this.fileExt( path ) ) {
                case 'raw': return content;
                case 'json': return JSON.parse( content );
                case 'csv': return parse( content );
            }
            throw new Error( `Unsupported file extension: ${ extname( path ) }` );
        }, `Failed to read ${path}` );
    }

    public exists ( path: string ) : boolean {
        return existsSync( this.resolvePath( path ) );
    }

    public assertPath ( path: string ) : void | never {
        if ( ! this.exists( path ) ) throw new Error( `Path ${path} does not exist` );
    }

    public ensurePath ( path: string, isDir: boolean = false ) : void {
        path = this.resolvePath( path );
        mkdirSync( isDir ? path : dirname( path ), { recursive: true } );
    }

    public scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[] {
        this.assertPath( path = this.resolvePath( path ) );
        return readdirSync( path ).filter( f => ext.includes( this.fileExt( f ) ) );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
