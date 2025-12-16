import { Index } from '@/abstract/Index';
import { TListIndex, TListIndexItem } from '@/types/list';

export class ListIndex extends Index< TListIndex > {

    protected static instance: ListIndex;

    private constructor () {
        super();
    }

    protected loadIndex () : TListIndex {
        const raw = this.storage.readJSON< Record< string, TListIndexItem > > ( 'list/index.json' ) || {};
        return new Map( Object.entries( raw ) );
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
