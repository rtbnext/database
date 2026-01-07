import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export interface IProfile {
    getUri () : string;
    getItem () : TProfileIndexItem;
    getMeta () : TMetaData[ '@metadata' ];
    schemaVersion () : number;
    modified () : string;
    modifiedTime () : number;
    verify ( id: string ) : boolean;
    getData () : TProfileData;
    setData (
        data: TProfileData, aliases?: string[],
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void;
    updateData (
        data: Partial< TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace',
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void;
    getHistory () : TProfileHistory;
    setHistory ( history: TProfileHistory ) : void;
    addHistory ( row: TProfileHistoryItem ) : void;
    mergeHistory ( history: TProfileHistory ) : void;
    save () : void;
}
