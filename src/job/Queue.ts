import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class QueueJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Queue' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            //
        } );
    }

}

jobRunner( QueueJob );
