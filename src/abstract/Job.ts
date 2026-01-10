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

    constructor ( job: string ) {
        this.job = job;
        this.args = Utils.parseArgs( process.argv.slice( 2 ) );
        this.silent = !! this.args.silent;
        this.safeMode = !! this.args.safeMode;

        log.info( `Run job: ${job}`, this.args );
    }

    // Job helper

    protected log ( msg: string, meta?: any, as: TLoggingLevel = 'info' ) : void {
        if ( ! this.silent ) log[ as ]( msg, meta );
    }

    protected err ( err: unknown, msg?: string ) : void {
        if ( ! this.silent ) log.errMsg( err, msg );
    }

}
