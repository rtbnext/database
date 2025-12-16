import { Index } from '@/abstract/Index';
import { TListIndex, TListIndexItem } from '@/types/list';
import { Utils } from '@/utils';

export class ListIndex extends Index< TListIndex, TListIndexItem > {

    protected static instance: ListIndex;

    private constructor () {
        super();
    }

    protected loadIndex () : TListIndex {
        const raw = this.storage.readJSON< Record< string, TListIndexItem > > ( 'list/index.json' ) || {};
        return new Map( Object.entries( raw ) );
    }

    protected saveIndex () : void {
        const content = Object.fromEntries( Utils.sort< TListIndex >( this.index ) );
        this.storage.writeJSON< Record< string, TListIndexItem > >( 'list/index.json', content );
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
