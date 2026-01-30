import { TListItem } from '@rtbnext/schema/src/model/list';

import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ListQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { TQueueOptions } from '@/types/queue';
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
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const rawList = res.data.personList.personsLists;
            const entries = rawList.filter( i => i.rank && i.finalWorth ).filter( Boolean ).sort(
                ( a, b ) => a.rank! - b.rank!
            );

            this.log( `Processing "${name}" list from ${year} (${entries.length} items)` );

            let listDate = Parser.date( entries[ 0 ].date || entries[ 0 ].timestamp, 'ymd' )!;
            const items: TListItem[] = [];
            const queue: TQueueOptions[] = [];

            for ( const [ i, raw ] of Object.entries( entries ) ) {
                const parser = new ListParser( raw );
                const uri = parser.uri();
                const id = parser.id();
                const rank = parser.rank();
                const networth = parser.networth();
            }
        } );
    }

}

jobRunner( ListJob );
