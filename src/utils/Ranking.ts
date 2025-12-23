import { ListIndex } from '@/collection/ListIndex';
import { Queue } from '@/core/Queue';
import { TRanking, TRankingItem } from '@/types/generic';
import { TProfileResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';

export class Ranking {

    private static readonly index = ListIndex.getInstance();
    private static readonly queue = Queue.getInstance();

    public static generateProfileRanking (
        sortedLists: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
        history: boolean = true, queue: boolean = true
    ) : TRanking[] {
        const lists = new Map( Object.entries( rankingData ) );
        const entries = new Map< string, TRankingItem[] >();
        const names = new Map< string, string >();

        // Prepare new entries from sorted lists
        for ( const { listUri, name, date: _date, timestamp, rank, finalWorth } of sortedLists ) {
            if ( [ 'rtb', 'rtrl' ].includes( listUri ) ) continue;

            const date = Parser.date( _date ?? timestamp, 'ymd' )!;
            const item: TRankingItem = { date, rank: Parser.strict( rank, 'number' ), networth: Parser.strict( finalWorth, 'money' ) };

            if ( ! entries.has( listUri ) ) entries.set( listUri, [] );
            entries.get( listUri )!.push( item );
            names.set( listUri, name );
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
                    date: existing.date, rank: existing.rank,
                    networth: existing.networth,
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
            const name = existing?.name || names.get( listUri ) || listUri;
            const ranking: TRanking = {
                list: listUri, name, date: main.date, rank: main.rank, networth: main.networth,
                history: historyItems.length > 0 ? historyItems : undefined
            };

            result.push( ranking );

            // Queue list for future processing if needed
            if ( queue ) {
                const indexItem = Ranking.index.get( listUri );
                if ( ! indexItem || indexItem.date !== main.date ) Ranking.queue.add( 'list', listUri );
            }
        }

        return result;
    }

}
