import * as Generic from '@rtbnext/schema/src/abstract/generic';
import { TProfileBio, TProfileInfo } from '@rtbnext/schema/src/model/profile';

import { TParsedProfileName } from '@/types/parser';
import { TProfileResponse } from '@/types/response';

export interface IProfileParser {
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
