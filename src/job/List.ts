import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';

export class ListJob extends Job implements IJob {

    private static readonly fetch = Fetch.getInstance();
    private static readonly queue = ListQueue.getInstance();

    constructor ( args: string[] ) {
        super( args, 'List' );
    }

    public async run () : Promise< void > {}

}

jobRunner( ListJob );
