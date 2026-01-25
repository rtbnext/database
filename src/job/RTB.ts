import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { Stats } from '@/model/Stats';
import { TListResponse } from '@/types/response';

export class RTBJob extends Job implements IJob {

    private static readonly fetch = Fetch.getInstance();
    private static readonly queue = ProfileQueue.getInstance();
    private static readonly stats = Stats.getInstance();

    constructor ( args: string[] ) {
        super( args, 'RTB' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const res = await RTBJob.fetch.list< TListResponse >( 'rtb', '0', this.args.date );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );
        } );
    }

}

jobRunner( RTBJob );
