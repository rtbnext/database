import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { TListResponse } from '@/types/response';

export class ListJob extends Job implements IJob {

    private static readonly fetch = Fetch.getInstance();
    private static readonly queue = ListQueue.getInstance();

    constructor ( args: string[] ) {
        super( args, 'List' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            if ( ListJob.queue.size() < 1 ) {
                this.log( `No items in the list queue to process.` );
                return;
            }

            const item = ListJob.queue.next( 1 )[ 0 ];
            const { name, desc, year } = item.args as { name: string, desc: string, year: string };
            const res = await ListJob.fetch.list< TListResponse >( name, year );
        } );
    }

}

jobRunner( ListJob );
