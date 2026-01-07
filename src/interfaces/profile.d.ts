import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export interface IProfile {
    getUri () : string;
    getItem () : TProfileIndexItem;
    getMeta () : TMetaData[ '@metadata' ];
    schemaVersion () : number;
    modified () : string;
    modifiedTime () : number;
}
