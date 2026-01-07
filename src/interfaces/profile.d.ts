import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export interface IProfile {
    getUri () : string;
    getItem () : TProfileIndexItem;
    getMeta () : TMetaData[ '@metadata' ];
    schemaVersion () : number;
    modified () : string;
    modifiedTime () : number;
    getData () : TProfileData;
    setData ( data: TProfileData, aliases?: string[] ) : void;
    updateData (
        data: Partial< TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace'
    ) : void;
}
