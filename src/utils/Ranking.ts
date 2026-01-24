import { TRanking, TRankingItem } from '@rtbnext/schema/src/abstract/assets';

import { ListQueue } from '@/core/Queue';
import { ListIndex } from '@/model/ListIndex';
import { TProfileResponse } from '@/types/response';
import { TQueueOptions } from '@/types/queue';
import { Parser } from '@/parser/Parser';

export class Ranking {

    private static readonly index = ListIndex.getInstance();
    private static readonly queue = ListQueue.getInstance();

    public static generateProfileRanking (
        sortedLists: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
        history: boolean = true, addQueue: boolean = true
    ) : TRanking[] {
        const lists = new Map( rankingData.map( r => [ r.list, r ] ) );
        const entries = new Map< string, TRankingItem[] >();
        const names = new Map< string, { name: string, desc?: string } >();
        const queue: TQueueOptions[] = [];

        // Prepare new entries from sorted lists
        for ( const { listUri, name, listDescription, date, timestamp, rank, finalWorth } of sortedLists ) {
            if ( [ 'rtb', 'rtrl' ].includes( listUri ) ) continue;

            const item = Parser.container< TRankingItem >( {
                date: { value: date ?? timestamp, type: 'date', args: [ 'ymd' ], strict: false },
                rank: { value: rank, type: 'number' },
                networth: { value: finalWorth, type: 'money' }
            } );

            if ( ! entries.has( listUri ) ) entries.set( listUri, [] );
            entries.get( listUri )!.push( item );
            names.set( listUri, { name, desc: listDescription } );
        }

        // Merge existing and new entries
        const allListUris = new Set( [ ...lists.keys(), ...entries.keys() ] );
        const result: TRanking[] = [];

        if ( addQueue && queue.length ) this.queue.addMany( queue );
        return result;
    }

}
