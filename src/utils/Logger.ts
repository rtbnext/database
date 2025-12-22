import { Config } from '@/core/Config';
import { TLoggingConfig } from '@/types/config';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';

export class Logger {

    private static readonly LEVEL: Record< TLoggingConfig[ 'level' ], number > = {
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

    private logDate () : string {
        return new Date().toISOString().split( '-' ).slice( 0, 2 ).join( '-' );
    }

    private shouldLog ( level: TLoggingConfig[ 'level' ] ) : boolean {
        return Logger.LEVEL[ level ] <= Logger.LEVEL[ this.config.level ];
    }

    private format ( level: TLoggingConfig[ 'level' ], msg: string, meta?: any ) : string {
        const entry = `[${ new Date().toISOString() }] ${ level.toUpperCase() } ${msg}`;
        if ( meta instanceof Error ) entry.concat( `: ${ meta.stack?.replaceAll( '\n', ' // ' ) }` );
        else if ( meta ) entry.concat( `: ${ JSON.stringify( meta ) }` );
        return entry;
    }

    private log2Console ( level: TLoggingConfig[ 'level' ], entry: string ) : void {
        ( console[ level ] ?? console.log )( entry );
    }

    private log2File ( entry: string ) : void {
        const path = join( this.path, `${ this.logDate() }.log` );
        appendFileSync( path, entry + '\n', 'utf8' );
    }

    private log ( level: TLoggingConfig[ 'level' ], msg: string, meta?: any ) : void {
        if ( ! this.shouldLog( level ) ) return;
        const entry = this.format( level, msg, meta );
        if ( this.config.console ) this.log2Console( level, entry );
        if ( this.config.file ) this.log2File( entry );
    }

    public error ( msg: string, error?: Error ) : void {
        this.log( 'error', msg, error );
    }

    public exit ( msg: string, error?: Error ) : never {
        this.log( 'error', msg, error ); exit( 1 );
    }

    public warn ( msg: string, meta?: any ) : void {
        this.log( 'warn', msg, meta );
    }

    public info ( msg: string, meta?: any ) : void {
        this.log( 'info', msg, meta );
    }

    public debug ( msg: string, meta?: any ) : void {
        this.log( 'debug', msg, meta );
    }

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

}

export const log = Logger.getInstance();
