import { TLoggingConfig } from '@/types/config';

export interface ILogger {
    error ( msg: string, error?: Error ) : void;
    errMsg ( err: unknown, msg?: string ) : void;
    exit ( msg: string, error?: Error ) : never;
    warn ( msg: string, meta?: any ) : void;
    info ( msg: string, meta?: any ) : void;
    debug ( msg: string, meta?: any ) : void;
    catch< F extends ( ...args: any[] ) => any, R = ReturnType< F > > (
        fn: F, msg: string, level: TLoggingConfig[ 'level' ] = 'error'
    ) : R | undefined;
    catchAsync< F extends ( ...args: any[] ) => Promise< any >, R = Awaited< ReturnType< F > > > (
        fn: F, msg: string, level: TLoggingConfig[ 'level' ] = 'error'
    ) : Promise< R | undefined >;
    getLogFile ( date: string ) : string | undefined;
    getCurrentLogFile () : string | undefined;
}
