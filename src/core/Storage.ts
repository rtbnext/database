import { StorageConfig } from '@/types/config';
import { Logger } from '@/utils/Logger';
import { ConfigLoader } from './ConfigLoader';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { join, extname } from 'node:path';
import { cwd } from 'node:process';
import { parse, stringify } from 'csv-string';

export class Storage {

    private static instance: Storage;
    private readonly logger: Logger;
    private readonly config: StorageConfig;
    private readonly path: string;

    private constructor () {
        this.logger = Logger.getInstance();
        this.config = ConfigLoader.getInstance().storage;
        this.path = join( cwd(), this.config.baseDir );
        this.initDB();
    }

    private resolvePath ( path: string ) : string {
        return join( this.path, path );
    }

    private read ( path: string, type?: 'raw' | 'json' | 'csv' ) : any {
        try {
            this.assertPath( path = this.resolvePath( path ) );
            const content = readFileSync( path, 'utf8' );
            switch ( type ?? extname( path ).toLowerCase() ) {
                case 'raw': return content;
                case 'json': case '.json': return JSON.parse( content );
                case 'csv': case '.csv': return parse( content );
            }
            throw new Error( `Unsupported file extension: ${ extname( path ) }` );
        } catch ( err ) {
            this.logger.error( `Failed to read ${path}: ${ ( err as Error ).message }`, err as Error );
            throw err;
        }
    }

    private write (
        path: string, content: any, type?: 'raw' | 'json' | 'csv',
        options = { append: false, nl: true }
    ) : void {
        try {
            this.assertPath( path = this.resolvePath( path ) );
            switch ( type ?? extname( path ).toLowerCase() ) {
                case 'json': case '.json': content = JSON.stringify(
                    content, null, this.config.compressing ? 2 : undefined
                );
                case 'csv': case '.csv': content = stringify( content );
            }
            if ( options.nl ) content += EOL;
            if ( options.append ) appendFileSync( path, content, 'utf8' );
            else writeFileSync( path, content, 'utf8' );
        } catch ( err ) {
            this.logger.error( `Failed to write ${path}: ${ ( err as Error ).message }`, err as Error );
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
        mkdirSync( this.resolvePath( path ), { recursive: true } );
    }

    public readJSON< T > ( path: string ) : T | false {
        try { return this.read( path, 'json' ) as T }
        catch { return false }
    }

    public writeJSON< T > ( path: string, content: T ) : boolean {
        try { this.write( path, content, 'json' ); return true }
        catch { return false }
    }

    public readCSV< T extends [] > ( path: string ) : T | false {
        try { return this.read( path, 'csv' ) as T }
        catch { return false }
    }

    public writeCSV< T extends [] > ( path: string, content: T ) : boolean {
        try { this.write( path, content, 'csv' ); return true }
        catch { return false }
    }

    public appendCSV< T extends [] > ( path: string, content: T, nl: boolean = true ) : boolean {
        try { this.write( path, content, 'csv', { append: true, nl } ); return true }
        catch { return false }
    }

    public initDB () : void {
        [ 'profile', 'list', 'filter', 'mover', 'stats' ].forEach( this.ensurePath );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
