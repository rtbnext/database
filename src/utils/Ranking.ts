import { TRanking } from '@rtbnext/schema/src/abstract/assets';

import { ListQueue } from '@/core/Queue';
import { ListIndex } from '@/model/ListIndex';
import { TProfileResponse } from '@/types/response';

export class Ranking {

    private static readonly index = ListIndex.getInstance();
    private static readonly queue = ListQueue.getInstance();

    public static generateProfileRanking (
        sortedLists: TProfileResponse[ 'person' ][ 'personLists' ], rankingData: TRanking[] = [],
        history: boolean = true, addQueue: boolean = true
    ) : TRanking[] {}

}
