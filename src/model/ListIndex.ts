import { Index } from '@/abstract/Index';
import { IListIndex } from '@/interfaces/index';
import { TListIndex, TListIndexItem } from '@rtbnext/schema/src/model/list';

export class ListIndex extends Index< TListIndexItem, TListIndex > implements IListIndex {

    protected static instance: ListIndex;

    private constructor () {
        super( 'list', 'list/index.json' );
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
