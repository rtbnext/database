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
        const map = new Map< string, TRankingItem[] >();

        for ( const { listUri, name, date: _date, timestamp, rank, finalWorth } of sortedLists ) {
            if ( [ 'rtb', 'rtrl' ].includes( listUri ) ) continue;

            const date = Parser.date( _date ?? timestamp, 'ymd' )!;
            const item = { date, name, rank: Parser.strict( rank, 'number' ), networth: Parser.strict( finalWorth, 'money' ) };

            if ( ! map.has( listUri ) ) map.set( listUri, [] );
            map.get( listUri )!.push( item );
        }
    }

}
