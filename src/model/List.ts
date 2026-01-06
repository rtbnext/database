import { Snapshot } from '@/abstract/Snapshot';
import { IList } from '@/interfaces/list';
import { ListIndex } from '@/model/ListIndex';
import { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

export class List extends Snapshot< TListSnapshot > implements IList {

    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private data: TListIndexItem;

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        super( 'list', 'json' );
        this.uri = item.uri;
        this.data = item;
    }

}
