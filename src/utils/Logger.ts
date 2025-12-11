import { LoggingConfig } from '../types/config';
import { ConfigLoader } from './ConfigLoader';
import { exit } from 'node:process';

export class Logger {

    private static readonly LEVELS: Record< LoggingConfig[ 'level' ], number > = {
        'error': 0, 'warn': 1, 'info': 2, 'debug': 3
    };

    private static instance: Logger;
    private readonly config: LoggingConfig;

    private constructor () {
        this.config = ConfigLoader.getInstance().logging;
    }

    private shouldLog ( level: LoggingConfig[ 'level' ] ) : boolean {
        return Logger.LEVELS[ level ] <= Logger.LEVELS[ this.config.level ];
    }

    private format ( level: LoggingConfig[ 'level' ], msg: string, meta?: any ) : string {
        return `${ new Date().toISOString() } [${ level.toUpperCase() }] ${msg}`;
    }

    private log2Console ( entry: string ) : void {}

    private log2File ( entry: string ) : void {}

    private log ( level: LoggingConfig[ 'level' ], msg: string, meta?: any ) : void {
        if ( ! this.shouldLog( level ) ) return;

        const entry = this.format( level, msg, meta );
        if ( this.config.console ) this.log2Console( entry );
        if ( this.config.file ) this.log2File( entry );
    }

    public error ( msg: string, error?: Error ) : void {
        this.log( 'error', msg, error );
    }

    public exit ( msg: string, error?: Error ) : never {
        this.log( 'error', msg, error );
        exit( 1 );
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
