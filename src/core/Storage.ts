import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { Config } from './Config';

export interface StorageConfig {
    baseDir: string;
    minify: boolean;
};

export class Storage {

    private static instance: Storage;
    private static readonly cwd = process.cwd();
    private readonly config: StorageConfig;

    private constructor () {

        this.config = Config.load< StorageConfig >( 'storage' )!;

    }

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private pathBuilder ( path: string ) : string {

        return join( Storage.cwd, this.config.baseDir, path );

    }

    private async saveJson< T extends {} = any > ( path: string, data: T ) : Promise< void > {

        const content = JSON.stringify( data, null, this.config.minify ? undefined : 2 );
        await writeFile( this.pathBuilder( path ), content, 'utf8' );

    }

    private async loadJson< T = any > ( path: string ) : Promise< T | undefined > {

        if ( ! existsSync( path ) ) return;

        const content = await readFile( this.pathBuilder( path ), 'utf8' );
        return JSON.parse( content ) as T;

    }

    private async saveCSV< T extends [] = any > ( path: string, data: T ) : Promise< void > {

        const content = stringify( data, { delimiter: ' ' } );
        await writeFile( this.pathBuilder( path ), content, 'utf8' );

    }

    private async loadCSV< T = any > ( path: string ) : Promise< T | undefined > {

        if ( ! existsSync( path ) ) return;

        const content = await readFile( this.pathBuilder( path ), 'utf8' );
        return parse( content, { bom: true, delimiter: ' ' } ) as T;

    }

}
