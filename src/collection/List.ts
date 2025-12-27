import { Dated } from '@/abstract/Dated';
import { ListIndex } from '@/collection/ListIndex';
import { Storage } from '@/core/Storage';
import { TListIndexItem, TListSnapshot } from '@/types/list';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
import { join } from 'node:path';

export class List extends Dated {

    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private data: TListIndexItem;

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        super( `list/${item.uri}` );
        this.uri = item.uri;
        this.data = item;
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

}
