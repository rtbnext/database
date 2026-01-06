import { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/abstract/const';
import { TFilter, TFilterList } from '@rtbnext/schema/src/model/filter';

export interface IFilter {
    resolvePath ( path: string ) : string | false;
    getFilter ( group: TFilterGroup, key: string ) : TFilter | undefined;
    getFilterByPath ( path: string ) : TFilter | undefined;
    getGroup ( group: TFilterGroup ) : Record< string, TFilter > | undefined;
    getSpecial ( special: TFilterSpecial ) : TFilter | undefined;
    has ( path: string, uriLike: string ) : boolean;
    save ( collection: Partial< TFilterList > ) : void;
}
