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

        // Generate final rankings
        for ( const listUri of allListUris ) {
            const existing = lists.get( listUri );
            const news = entries.get( listUri ) || [];
            const allItems: TRankingItem[] = [];

            // Add existing entry
            if ( existing ) {
                allItems.push( {
                    date: existing.date, rank: existing.rank, networth: existing.networth,
                    prev: existing.prev, next: existing.next
                } );
                if ( existing.history ) allItems.push( ...existing.history );
            }

            // Add new entries and sort by date
            allItems.push( ...news );
            allItems.sort( ( a, b ) => b.date.localeCompare( a.date ) );

            const main = allItems[ 0 ];
            let historyItems: TRankingItem[] = [];

            // Prepare history
            if ( history ) historyItems = allItems.slice( 1 );
            else if ( existing?.history ) historyItems = [ ...existing.history ];
            historyItems.sort( ( a, b ) => b.date.localeCompare( a.date ) );

            // Create final ranking entry
            const name = existing?.name || names.get( listUri )?.name || listUri;
            const ranking: TRanking = {
                list: listUri, name, date: main.date, rank: main.rank, prev: main.prev,
                next: main.next, networth: main.networth, history: historyItems
            };

            result.push( ranking );

            // Queue list for future processing if needed
            if ( addQueue && main.rank && main.networth ) {
                const indexItem = Ranking.index.get( listUri );
                if ( ! indexItem || indexItem.date !== main.date ) queue.push( {
                    uriLike: listUri, args: {
                        name, desc: names.get( listUri )?.desc,
                        year: main.date.split( '-' )[ 0 ]
                    }
                } );
            }
        }

        if ( addQueue && queue.length ) this.queue.addMany( queue );
        return result;
    }

}
