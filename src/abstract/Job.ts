import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { Queue } from '@/core/Queue';
import { TConfigObject, TLoggingConfig } from '@/types/config';
import { TArgs } from '@/types/generic';
import { log } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export abstract class Job {

    protected readonly job: string;
    protected readonly silent: boolean;
    protected readonly safeMode: boolean;
    protected config: TConfigObject;
    protected queue: Queue;
    protected fetch: Fetch;

    constructor ( silent: boolean, safeMode: boolean, job: string ) {
        this.job = job;
        this.silent = silent;
        this.safeMode = safeMode;
        this.config = Config.getInstance();
        this.queue = Queue.getInstance();
        this.fetch = Fetch.getInstance();

        this.log( `Starting job: ${this.job}` );
    }

    protected async protect<
        F extends ( ...args: any[] ) => any,
        R = Awaited< ReturnType< F > >
    > ( fn: F ) : Promise< R | undefined > {
        try { return await fn() }
        catch ( err ) {
            if ( ! this.silent ) this.err( err );
            if ( ! this.safeMode ) throw err;
        }
    }

    protected log ( msg: string, meta?: any, as: TLoggingConfig[ 'level' ] = 'info' ) : void {
        if ( ! this.silent ) log[ as ]( msg, meta );
    }

    protected err ( err: unknown, msg?: string ) : void {
        if ( ! this.silent ) log.error(
            `Job [${this.job}] failed: ${ msg ?? ( err as Error ).message }`,
            err as Error
        );
    }

    public abstract run ( args: TArgs ) : void | Promise< void >;

}

export function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run', trigger: string = '--run',
    options: { silent?: boolean, safeMode?: boolean } = {}
) : void {
    if ( ! process.argv.includes( trigger ) ) return;

    const args = Utils.parseArgs( process.argv );
    const {
        silent = args.silent ? Parser.boolean( args.silent ) : false, 
        safeMode = args.safeMode ? Parser.boolean( args.safeMode ) : false
    } = options;

    try {
        const job = new ( cls as any )( silent, safeMode );
        ( job[ method ] as Function )( args );
    } catch ( err ) {
        if ( ! silent ) log.error( `Job failed: ${ ( err as Error ).message }`, err as Error );
        if ( ! safeMode ) throw err;
    }
}
