import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class ListJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'List' );
    }

    public async run () : Promise< void > {}

}

jobRunner( ListJob );
