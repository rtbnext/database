import { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import { ISnapshot } from '@/interfaces/snapshot';

export interface IList extends ISnapshot< TListSnapshot > {
    getUri () : string;
    getItem () : TListIndexItem;
}
