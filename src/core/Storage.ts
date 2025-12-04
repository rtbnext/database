import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { Config, ConfigObject } from './Config';

export class Storage {

    private static instance: Storage;
    private readonly config: ConfigObject[ 'storage' ];

    private constructor () {

        this.config = Config.getInstance().getStorageConfig();
        this.initDB();

    }

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private pathBuilder ( path: string, ext?: 'json' | 'csv' ) : string {

        path = path.replace( /(.json|.csv)/g, '' );
        if ( this.config.fileExtensions && ext ) path += `.${ext}`;

        return join( Config.cwd, this.config.baseDir, path );

    }

    public saveJson< T extends {} = any > ( path: string, data: T ) : void {

        const content = JSON.stringify( data, null, this.config.compression ? undefined : 2 );
        writeFileSync( this.pathBuilder( path, 'json' ), content, 'utf8' );

    }

    public loadJson< T = any > ( path: string ) : T | undefined {

        if ( ! existsSync( path ) ) return;

        const content = readFileSync( this.pathBuilder( path, 'json' ), 'utf8' );
        return JSON.parse( content ) as T;

    }

    public saveCSV< T extends [] = any > ( path: string, data: T ) : void {

        const content = stringify( data, { delimiter: this.config.csvDelimiter } ) as unknown as string;
        writeFileSync( this.pathBuilder( path, 'csv' ), content, 'utf8' );

    }

    public loadCSV< T = any > ( path: string ) : T | undefined {

        if ( ! existsSync( path ) ) return;

        const content = readFileSync( this.pathBuilder( path, 'csv' ), 'utf8' );
        return parse( content, { bom: true, delimiter: this.config.csvDelimiter } ) as T;

    }

    public initDB () {

        [ 'profile', 'list', 'mover', 'filter', 'stats' ].forEach (
            d => mkdirSync( this.pathBuilder( d ), { recursive: true } )
        );

    }

}
