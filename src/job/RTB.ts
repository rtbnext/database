import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class RTBJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'RTB' );
    }

    public async run () : Promise< void > {}

}

jobRunner( RTBJob );
