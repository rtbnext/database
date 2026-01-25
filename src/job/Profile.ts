import { Job, jobRunner } from '@/abstract/Job';
import { ProfileQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { Parser } from '@/parser/Parser';

export class ProfileJob extends Job implements IJob {

    private static readonly queue = ProfileQueue.getInstance();

    constructor ( args: string[] ) {
        super( args, 'Profile' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const method = Parser.boolean( this.args.replace ) ? 'setData' : 'updateData';
            const batch = 'profile' in this.args && typeof this.args.profile === 'string'
                ? this.args.profile.split( ',' ).filter( Boolean )
                : ProfileJob.queue.nextUri( Job.config.fetch.rateLimit.batchSize );
        } );
    }

}

jobRunner( ProfileJob );
