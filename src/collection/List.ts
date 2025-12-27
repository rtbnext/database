import { Dated } from '@/abstract/Dated';
import { ListIndex } from '@/collection/ListIndex';
import { TListIndexItem, TListSnapshot } from '@/types/list';

export class List extends Dated< TListSnapshot > {

    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private data: TListIndexItem;

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        super( `list/${item.uri}` );
        this.uri = item.uri;
        this.data = item;
    }

    public getUri () : string {
        return this.uri;
    }

    public getData () : TListIndexItem {
        return this.data;
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

}
