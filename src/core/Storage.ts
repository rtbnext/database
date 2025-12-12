import { StorageConfig } from '@/types/config';
import { Logger } from '@/utils/Logger';
import { ConfigLoader } from './ConfigLoader';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { cwd } from 'node:process';
import { parse } from 'csv-string';

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

    private read ( path: string, raw: boolean = false ) : any {
        try {
            this.assertPath( path = this.resolvePath( path ) );
            const content = readFileSync( path, 'utf8' );
            if ( raw ) return content;
            switch ( extname( path ).toLowerCase() ) {
                case '.json': return JSON.parse( content );
                case '.csv': return parse( content );
            }
            throw new Error( `Unsupported file extension: ${ extname( path ) }` );
        } catch ( err ) {
            this.logger.error( `Failed to read file at path: ${path}`, err as Error );
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

    public initDB () : void {
        [ 'profile', 'list', 'filter', 'mover', 'stats' ].forEach( this.ensurePath );
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
