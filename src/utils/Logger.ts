import { LoggingConfig } from '@/types/config';
import { ConfigLoader } from '@/core/ConfigLoader';
import { appendFileSync, mkdirSync } from 'node:fs';
import { EOL } from 'node:os';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';

export class Logger {

    private static readonly LEVEL: Record< LoggingConfig[ 'level' ], number > = {
        error: 0, warn: 1, info: 2, debug: 3
    };

    private static instance: Logger;
    private readonly config: LoggingConfig;
    private readonly path: string;

    private constructor () {
        this.config = ConfigLoader.getInstance().logging;
        this.path = join( cwd(), 'logs' );
        if ( this.config.file ) mkdirSync( this.path );
    }

    private logDate () : string {
        return new Date().toISOString().split( '-' ).slice( 0, 2 ).join( '-' );
    }

    private shouldLog ( level: LoggingConfig[ 'level' ] ) : boolean {
        return Logger.LEVEL[ level ] <= Logger.LEVEL[ this.config.level ];
    }

    private format ( level: LoggingConfig[ 'level' ], msg: string, meta?: any ) : string {
        const entry = `[${ new Date().toISOString() }] ${ level.toUpperCase() } ${msg}`;
        if ( meta instanceof Error ) entry.concat( `: ${ meta.stack?.replaceAll( '\n', ' // ' ) }` );
        else if ( meta ) entry.concat( `: ${ JSON.stringify( meta ) }` );
        return entry;
    }

    private log2Console ( level: LoggingConfig[ 'level' ], entry: string ) : void {
        ( console[ level ] ?? console.log )( entry );
    }

    private log2File ( entry: string ) : void {
        const path = join( this.path, `${ this.logDate() }.log` );
        appendFileSync( path, entry + EOL, 'utf8' );
    }

    private log ( level: LoggingConfig[ 'level' ], msg: string, meta?: any ) : void {
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
