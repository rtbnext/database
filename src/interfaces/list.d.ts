import { ISnapshot } from '@/interfaces/snapshot';
import { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

export interface IList extends ISnapshot< TListSnapshot > {
    getUri () : string;
    getItem () : TListIndexItem;
}
