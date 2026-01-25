import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class ProfileJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Profile' );
    }

    public async run () : Promise< void > {}

}

jobRunner( ProfileJob );
