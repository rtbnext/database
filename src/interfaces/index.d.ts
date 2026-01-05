import { TIndex } from '@rtbnext/schema/src/abstract/generic';
import { TListIndex, TListIndexItem } from '@rtbnext/schema/src/model/list';
import { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export interface IIndex< I extends TIndex, T extends Map< string, I > > {
    getIndex () : T;
    size () : number;
    has ( uriLike: string ) : boolean;
    get ( uriLike: string ) : I | undefined;
    update ( uriLike: string, data: Partial< I >, allowUpdate: boolean = true, save: boolean = true ) : I | false;
    delta ( items: { uriLike: string, data: Partial< I > }[], allowUpdate: boolean = true ) : number;
    add ( uriLike: string, data: I ) : I | false;
    delete ( uriLike: string ) : void;
    search ( query: string, looseMatch: boolean = false ) : T;
}

export interface IProfileIndex extends IIndex< TProfileIndexItem, TProfileIndex > {
    find ( uriLike: string ) : TProfileIndex;
    move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false;
}

export interface IListIndex extends IIndex< TListIndexItem, TListIndex > {}
