import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import {  } from 'node:path';

export class Storage {

    private static instance: Storage;

    private constructor () {}

    public static getInstance () : Storage {

        if ( ! Storage.instance ) Storage.instance = new Storage();
        return Storage.instance;

    }

    private async saveJson< T = any > ( filePath: string, data: T ) : Promise< void > {

        const jsonData = JSON.stringify( data, null, 2 );
        await writeFile( filePath, jsonData, 'utf8' );

    }

    private async loadJson< T = any > ( filePath: string ) : Promise< T | false > {

        if ( ! existsSync( filePath ) ) return false;

        const data = await readFile( filePath, 'utf8' );
        return JSON.parse( data ) as T;

    }

}
