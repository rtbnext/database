import { TListIndex, TListIndexItem } from '@rtbnext/schema/src/model/list';

import { Index } from '@/abstract/Index';
import { IListIndex } from '@/interfaces/index';

export class ListIndex extends Index< TListIndexItem, TListIndex > implements IListIndex {

    protected static instance: ListIndex;

    private constructor () {
        super( 'list', 'list/index.json' );
    }

    // Instantitate

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
