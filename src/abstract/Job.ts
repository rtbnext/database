import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';
import { Queue } from '@/core/Queue';
import { TConfigObject, TLoggingConfig } from '@/types/config';
import { TArgs } from '@/types/generic';
import helper, { Utils } from '@/utils';

export abstract class Job {

    protected readonly job!: string;
    protected readonly silent: boolean;
    protected readonly safeMode: boolean;
    protected config: TConfigObject;
    protected queue: Queue;
    protected fetch: Fetch;

    constructor ( silent: boolean, safeMode: boolean ) {
        this.silent = silent;
        this.safeMode = safeMode;
        this.config = ConfigLoader.getInstance();
        this.queue = Queue.getInstance();
        this.fetch = Fetch.getInstance();
    }

    protected async catch<
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
        if ( ! this.silent ) helper.log[ as ]( msg, meta );
    }

    protected err ( err: unknown, msg?: string, exit: boolean = true ) : void {
        if ( ! this.silent ) helper.log.error(
            `Job [${this.job}] failed: ${ msg ?? ( err as Error ).message }`,
            err as Error
        );
        if ( exit ) process.exit( 1 );
    }

    public abstract run ( args: TArgs ) : void | Promise< void >;

}

export function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run', trigger: string = '--run',
    options: { silent?: boolean, safeMode?: boolean } = {}
) : void {
    if ( ! process.argv.includes( trigger ) ) return;
    const { silent = false, safeMode = false } = options;

    try {
        const job = new ( cls as any )( silent, safeMode );
        const args = Utils.parseArgs( process.argv );
        ( job[ method ] as Function )( args );
    } catch ( err ) {
        if ( ! silent ) helper.log.error(
            `Job failed: ${ ( err as Error ).message }`,
            err as Error
        );
        if ( ! safeMode ) throw err;
    }
}
