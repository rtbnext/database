import { TAsset, TRealtime } from '@rtbnext/schema/src/abstract/assets';
import * as Generic from '@rtbnext/schema/src/abstract/generic';
import { TProfileBio, TProfileData, TProfileInfo } from '@rtbnext/schema/src/model/profile';

import { ICache } from '@/interfaces/cache';
import { TParsedProfileName } from '@/types/parser';
import { TListResponseEntry, TProfileResponse } from '@/types/response';

export interface IProfileParser extends ICache {
    rawData () : TProfileResponse[ 'person' ];
    sortedLists () : TProfileResponse[ 'person' ][ 'personLists' ];
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : TParsedProfileName;
    info () : TProfileInfo;
    citizenship () : string | undefined;
    education () : Generic.TEducation[];
    selfMade () : Generic.TSelfMade;
    philanthropyScore () : number | undefined;
    organization () : Generic.TOrganization | undefined;
    bio () : TProfileBio;
    cv () : string[];
    facts () : string[];
    quotes () : string[];
    related () : Generic.TRelation[];
    media () : Generic.TImage[];
}

export interface IListParser extends ICache {
    rawData () : TListResponseEntry;
    uri () : string;
    id () : string;
    date () : string;
    rank () : number | undefined;
    networth () : number | undefined;
    dropOff () : boolean | undefined;
    name () : TParsedProfileName;
    info () : Partial< TProfileInfo >;
    bio () : TProfileBio;
    age () : number | undefined;
    assets () : TAsset[];
    realtime (
        data?: Partial< TProfileData >,
        prev?: string, next?: string
    ) : TRealtime | undefined;
}
