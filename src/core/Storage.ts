import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import { IStorage } from '@/interfaces/storage';
import { TStorageConfig } from '@/types/config';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { parse, stringify } from 'csv-string';

export class Storage implements IStorage {

    private static instance: Storage;

    private readonly config: TStorageConfig;
    private readonly path: string;

    private constructor () {
        const { root, storage } = Config.getInstance();
        this.config = storage;
        this.path = join( root, this.config.baseDir );
        this.initDB();
    }

    private initDB () : void {
        log.debug( `Initializing storage at ${this.path}` );
        this.ensurePath( this.path );
        [ 'profile', 'list', 'filter', 'mover', 'stats', 'queue' ].forEach(
            path => this.ensurePath( path, true )
        );
    }

    // Private helper methods

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

    // Basic path operations

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

    // JSON files

    public readJSON< T > ( path: string ) : T | false {
        try { return this.read( path, 'json' ) as T }
        catch { return false }
    }

    public writeJSON< T > ( path: string, content: T ) : boolean {
        try { this.write( path, Utils.sortKeysDeep( content ), 'json' ); return true }
        catch { return false }
    }

    // CSV files

    public readCSV< T extends any[] > ( path: string ) : T | false {
        try { return this.read( path, 'csv' ) as T }
        catch { return false }
    }

    public writeCSV< T extends any[] > ( path: string, content: T ) : boolean {
        try { this.write( path, content, 'csv' ); return true }
        catch { return false }
    }

    public appendCSV< T extends any[] > (
        path: string, content: T, nl: boolean = true
    ) : boolean {
        try { this.write( path, content, 'csv', { append: true, nl } ); return true }
        catch { return false }
    }

    public datedCSV< T extends any[] > (
        path: string, content: T, force: boolean = false
    ) : boolean {
        const raw = this.readCSV< T >( path ) || [];
        const filtered = raw.filter( r => r[ 0 ] !== content[ 0 ] );
        if ( ! force && raw.length !== filtered.length ) return false;
        return this.writeCSV< T >( path, [ ...filtered, content ].sort(
            ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] )
        ) as T );
    }

    // Special file operations

    public move ( from: string, to: string, force: boolean = false ) : boolean {
        return !! log.catch( () => {
            this.assertPath( from = this.resolvePath( from ) );
            if ( this.exists( to = this.resolvePath( to ) ) ) {
                if ( force ) this.remove( to, true );
                else throw new Error( `Destination path ${to} already exists` );
            }
            renameSync( from, to );
            log.debug( `Moved ${from} to ${to}` );
            return true;
        }, `Failed to move ${from} to ${to}` );
    }

    public remove ( path: string, force: boolean = true ) : boolean {
        return !! log.catch( () => {
            this.assertPath( path = this.resolvePath( path ) );
            rmSync( path, { recursive: true, force } );
            log.debug( `Removed ${path}` );
            return true;
        }, `Failed to delete ${path}` );
    }

    // Instantiate

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
