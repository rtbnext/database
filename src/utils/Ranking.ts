import { TRanking } from '@/types/generic';
import { TProfileResponse } from '@/types/response';

export class Ranking {

    public static generateProfileRanking (
        listData: TProfileResponse[ 'person' ][ 'personLists' ], rankingData?: TRanking[]
    ) : TRanking[] {
        return [];
    }

}
