import { existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { Config, ConfigObject } from './Config';

export class Storage {

    private static instance: Storage;
    private readonly config: ConfigObject[ 'storage' ];

    private constructor () {

        this.config = Config.getInstance().getStorageConfig();

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

    private async saveJson< T extends {} = any > ( path: string, data: T ) : Promise< void > {

        const content = JSON.stringify( data, null, this.config.compression ? undefined : 2 );
        await writeFile( this.pathBuilder( path, 'json' ), content, 'utf8' );

    }

    private async loadJson< T = any > ( path: string ) : Promise< T | undefined > {

        if ( ! existsSync( path ) ) return;

        const content = await readFile( this.pathBuilder( path, 'json' ), 'utf8' );
        return JSON.parse( content ) as T;

    }

    private async saveCSV< T extends [] = any > ( path: string, data: T ) : Promise< void > {

        const content = stringify( data, { delimiter: this.config.csvDelimiter } );
        await writeFile( this.pathBuilder( path, 'csv' ), content, 'utf8' );

    }

    private async loadCSV< T = any > ( path: string ) : Promise< T | undefined > {

        if ( ! existsSync( path ) ) return;

        const content = await readFile( this.pathBuilder( path, 'csv' ), 'utf8' );
        return parse( content, { bom: true, delimiter: this.config.csvDelimiter } ) as T;

    }

    public async initDB () {

        [ 'profile', 'list', 'mover', 'filter', 'stats' ].forEach (
            d => mkdirSync( this.pathBuilder( d ), { recursive: true } )
        );

    }

}
