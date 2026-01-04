import { Config } from '@/core/Config';
import { Utils } from '@/core/Utils';
import { TLoggingConfig } from '@/types/config';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export class Logger {

    private static readonly level: Record< TLoggingConfig[ 'level' ], number > = {
        error: 0, warn: 1, info: 2, debug: 3
    };

    private static instance: Logger;
    private readonly config: TLoggingConfig;
    private readonly path: string;

    private constructor () {
        const { root, logging } = Config.getInstance();
        this.config = logging;
        this.path = join( root, 'logs' );
        mkdirSync( this.path, { recursive: true } );
    }

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

    private shouldLog ( level: TLoggingConfig[ 'level' ] ) : boolean {
        return Logger.level[ level ] <= Logger.level[ this.config.level ];
    }

    private format ( level: TLoggingConfig[ 'level' ], msg: string, meta?: any ) : string {
        const entry = `[${ Utils.date( 'iso' ) }] ${ level.toUpperCase() } ${msg}`;
        if ( meta instanceof Error ) entry.concat( `: ${ meta.stack?.replaceAll( '\n', ' // ' ) }` );
        else if ( meta ) entry.concat( `: ${ JSON.stringify( meta ) }` );
        return entry;
    }

    private log2Console ( level: TLoggingConfig[ 'level' ], entry: string ) : void {
        ( console[ level ] ?? console.log )( entry );
    }

    private log2File ( entry: string ) : void {
        const path = join( this.path, `${ Utils.date( 'ym' ) }.log` );
        appendFileSync( path, entry + '\n', 'utf8' );
    }

}

export const log = Logger.getInstance();
