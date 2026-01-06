import { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/abstract/const';
import { TFilter } from '@rtbnext/schema/src/model/filter';

export interface IFilter {
    resolvePath ( path: string ) : string | false;
    getFilter ( group: TFilterGroup, key: string ) : TFilter[] | false;
    getFilterByPath ( path: string ) : TFilter[] | false;
    getGroup ( group: TFilterGroup ) : Record< string, TFilter[] >;
    getSpecial ( special: TFilterSpecial ) : TFilter[];
    has ( path: string, uriLike: string ) : boolean;
    save ( collection: Partial< TFilterCollection > ) : void;
}
