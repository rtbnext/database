import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { TStorageConfig } from '@/types/config';
import { Utils } from '@/utils/Utils';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
        this.initDB();
    }

    private logError ( msg: string, err: unknown ) : void {
        log.error( `${msg}: ${ ( err as Error ).message }`, err as Error );
    }

    private resolvePath ( path: string ) : string {
        return path.includes( this.path ) ? path : join( this.path, path );
    }

    private fileExt ( path: string ) : string {
        return extname( this.resolvePath( path ) ).toLowerCase().replace( '.', '' );
    }

    private read ( path: string, type?: 'raw' | 'json' | 'csv' ) : any {
        try {
            this.assertPath( path = this.resolvePath( path ) );
            const content = readFileSync( path, 'utf8' );
            switch ( type ?? this.fileExt( path ) ) {
                case 'raw': return content;
                case 'json': return JSON.parse( content );
                case 'csv': return parse( content );
            }
            throw new Error( `Unsupported file extension: ${ extname( path ) }` );
        } catch ( err ) {
            this.logError( `Failed to read ${path}`, err );
            throw err;
        }
    }

    private write (
        path: string, content: any, type?: 'raw' | 'json' | 'csv',
        options = { append: false, nl: true }
    ) : void {
        try {
            this.ensurePath( path = this.resolvePath( path ) );
            switch ( type ?? this.fileExt( path ) ) {
                case 'csv': content = stringify( content ); break;
                case 'json': content = JSON.stringify(
                    content, null, this.config.compressing ? 2 : undefined
                ); break;
            }
            if ( options.nl && ! content.endsWith( '\n' ) ) content += '\n';
            if ( options.append ) appendFileSync( path, content, 'utf8' );
            else writeFileSync( path, content, 'utf8' );
            log.debug( `Wrote data to ${path} (appending: ${ String( options.append ) })` );
        } catch ( err ) {
            this.logError( `Failed to write ${path}`, err );
            throw err;
        }
    }

    public exists ( path: string ) : boolean {
        return existsSync( this.resolvePath( path ) );
    }

    public assertPath ( path: string ) : void | never {
        if ( ! this.exists( path ) ) throw new Error( `Path ${path} does not exist` );
    }

    public ensurePath ( path: string ) : void {
        mkdirSync( dirname( this.resolvePath( path ) ), { recursive: true } );
    }

    public scanDir ( path: string, ext: string[] = [ 'json', 'csv' ] ) : string[] {
        this.assertPath( path = this.resolvePath( path ) );
        return readdirSync( path ).filter( f => ext.includes( this.fileExt( f ) ) );
    }

    public readJSON< T > ( path: string ) : T | false {
        try { return this.read( path, 'json' ) as T }
        catch { return false }
    }

    public writeJSON< T > ( path: string, content: T ) : boolean {
        try { this.write( path, Utils.sortKeysDeep( content ), 'json' ); return true }
        catch { return false }
    }

    public readCSV< T extends any[] > ( path: string ) : T | false {
        try { return this.read( path, 'csv' ) as T }
        catch { return false }
    }

    public writeCSV< T extends any[] > ( path: string, content: T ) : boolean {
        try { this.write( path, content, 'csv' ); return true }
        catch { return false }
    }

    public appendCSV< T extends any[] > ( path: string, content: T, nl: boolean = true ) : boolean {
        try { this.write( path, content, 'csv', { append: true, nl } ); return true }
        catch { return false }
    }

    public move ( from: string, to: string, force: boolean = false ) : boolean {
        try {
            this.assertPath( from = this.resolvePath( from ) );
            if ( this.exists( to = this.resolvePath( to ) ) ) {
                if ( force ) this.remove( to, true );
                else throw new Error( `Destination path ${to} already exists` );
            }
            renameSync( from, to );
            log.debug( `Moved ${from} to ${to}` );
            return true;
        } catch ( err ) {
            this.logError( `Failed to move ${from} to ${to}`, err );
            return false;
        }
    }

    public remove ( path: string, force: boolean = true ) : boolean {
        try {
            this.assertPath( path = this.resolvePath( path ) );
            rmSync( path, { recursive: true, force } );
            log.debug( `Removed ${path}` );
            return true;
        } catch ( err ) {
            this.logError( `Failed to delete ${path}`, err );
            return false;
        }
    }

    public initDB () : void {
        log.info( `Initializing storage at ${this.path}` );
        this.ensurePath( this.path );
        [ 'profile', 'list', 'filter', 'mover', 'stats' ].forEach(
            path => this.ensurePath( path )
        );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
