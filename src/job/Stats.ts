import { Job } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class StatsJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Stats' );
    }

}
