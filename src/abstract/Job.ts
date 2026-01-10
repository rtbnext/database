import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { log } from '@/core/Logger';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IJob } from '@/interfaces/job';
import { TLoggingLevel } from '@/types/config';
import { TArgs } from '@/types/generic';

export abstract class Job implements IJob {

    protected static readonly config = Config.getInstance();
    protected static readonly storage = Storage.getInstance();
    protected static readonly fetch = Fetch.getInstance();
    protected static readonly profileQueue = ProfileQueue.getInstance();
    protected static readonly listQueue = ListQueue.getInstance();

    protected readonly job: string;
    protected readonly args: TArgs = {};
    protected readonly silent: boolean;
    protected readonly safeMode: boolean;

    constructor ( args: string[], job: string ) {
        this.job = job;
        this.args = Utils.parseArgs( args );

        const { silent, safeMode } = Job.config.job;
        this.silent = !! ( this.args.silent ?? silent );
        this.safeMode = !! ( this.args.safeMode ?? safeMode );

        this.log( `Run job`, this.args );
    }

    // Job helper

    protected log ( msg: string, meta?: any, as: TLoggingLevel = 'info' ) : void {
        if ( ! this.silent ) log[ as ]( `[${this.job}] ${msg}`, meta );
    }

    protected err ( err: unknown, msg?: string ) : void {
        if ( ! this.silent ) log.errMsg( err, msg ? `[${this.job}] ${msg}` : undefined );
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

    // Job getter

    public getJobName () : string {
        return this.job;
    }

    public getArgs () : TArgs {
        return this.args;
    }

    public isSilent () : boolean {
        return this.silent;
    }

    public isSafeMode () : boolean {
        return this.safeMode;
    }

    // Abstract job runner

    public abstract run ( ...args: any[] ) : void | Promise< void >;

}

export function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run',
    trigger: string = '--run', ...opt: string[]
) : void {
    if ( ! process.argv.includes( trigger ) ) return;

    try {
        const args = [ ...new Set( [ ...opt, ...process.argv.slice( 2 ) ] ) ];
        const job = new ( cls as any )( args ); ( job[ method ] as any )();
    } catch ( err ) {
        log.errMsg( err, `Failed to run job ${cls.name}` );
    }
}
