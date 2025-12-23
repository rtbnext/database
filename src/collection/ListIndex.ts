import { Index } from '@/abstract/Index';
import { TListIndex, TListIndexItem } from '@/types/list';
import { Ranking } from '@/utils/Ranking';

export class ListIndex extends Index< TListIndexItem, TListIndex > {

    protected static instance: ListIndex;

    private constructor () {
        super( 'list/index.json' );
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
