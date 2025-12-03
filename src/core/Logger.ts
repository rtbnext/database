import { appendFileSync, mkdirSync } from 'node:fs';
import { EOL } from 'node:os';
import { join } from 'node:path';
import { Config, ConfigObject } from './Config';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    context?: string;
    error?: string;
}

export class Logger {

    private static instance: Logger;
    private readonly config: ConfigObject[ 'logging' ];
    private readonly logPath: string;
    private readonly logFile: string;

    private constructor () {

        this.config = Config.getInstance().getLoggingConfig();
        this.logPath = join( Config.cwd, this.config.logDir );
        this.logFile = `${ new Date().getFullYear() }-${ new Date().getMonth() }.log`;

        mkdirSync( this.logPath, { recursive: true } );

    }

    public static getInstance () : Logger {

        if ( ! Logger.instance ) Logger.instance = new Logger();
        return Logger.instance;

    }

    private shouldLog ( level: LogLevel ) : boolean {

        return level <= this.config.level;

    }

    private getConsoleMethod ( level: LogLevel ) : Console[ 'log' ] {

        switch ( level ) {
            case LogLevel.ERROR: return console.error.bind( console );
            case LogLevel.WARN: return console.warn.bind( console );
            case LogLevel.DEBUG: return console.debug.bind( console );
            default: return console.log.bind( console );
        }

    }

    private log ( level: LogLevel, entry: LogEntry ) : void {

        if ( ! this.shouldLog( level ) ) return;

        const consoleMethod = this.getConsoleMethod( level );
        consoleMethod( `[${ entry.timestamp }] ${ entry.level.toUpperCase() }: ${ entry.message }` );
        if ( entry.context ) console.debug( `Context: ${ entry.context }` );
        if ( entry.error ) console.error( `Error: ${ entry.error }` );

        if ( ! this.config.saveLogs ) return;
        const logLine = JSON.stringify( entry ) + EOL;
        appendFileSync( join( this.logPath, this.logFile ), logLine );

    }

    public error ( message: string, context?: string, err?: Error ) : void {

        this.log( LogLevel.ERROR, {
            timestamp: new Date().toISOString(),
            level: 'error', message, context,
            error: err ? err.stack || err.message : undefined
        } );

    }

}
