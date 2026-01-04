import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import { TStorageConfig } from '@/types/config';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

    private write (
        path: string, content: any, type?: 'raw' | 'json' | 'csv',
        options = { append: false, nl: true }
    ) : void {
        log.catch( () => {
            this.ensurePath( path = this.resolvePath( path ) );
            switch ( type ?? this.fileExt( path ) ) {
                case 'csv': content = stringify( content ).trim(); break;
                case 'json': content = JSON.stringify(
                    content, null, this.config.compression ? undefined : 2
                ).trim(); break;
            }
            if ( options.nl && ! content.endsWith( '\n' ) ) content += '\n';
            ( options.append ? appendFileSync : writeFileSync )( path, content, 'utf8' );
            log.debug( `Wrote data to ${path}`, options );
        }, `Failed to write ${path}` );
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
        return log.catch( () => {
            this.assertPath( path = this.resolvePath( path ) );
            return readdirSync( path ).filter( f => ext.includes( this.fileExt( f ) ) );
        }, `Failed to scan ${path}` ) ?? [];
    }

    public readJSON< T > ( path: string ) : T | false {
        try { return this.read( path, 'json' ) as T }
        catch { return false }
    }

    public writeJSON< T > ( path: string, content: T ) : boolean {
        try { this.write( path, Utils.sortKeysDeep( content ), 'json' ); return true }
        catch { return false }
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
