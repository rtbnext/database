import { TParsedProfileName } from '@/types/parser';
import { TProfileResponse } from '@/types/response';
import * as G from '@rtbnext/schema/src/abstract/generic';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

export interface IProfileParser {
    rawData () : TProfileResponse[ 'person' ];
    sortedLists () : TProfileResponse[ 'person' ][ 'personLists' ];
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : TParsedProfileName;
    info () : TProfileData[ 'info' ];
    citizenship () : string | undefined;
    education () : G.TEducation[];
    selfMade () : G.TSelfMade;
    philanthropyScore () : number | undefined;
    organization () : G.TOrganization | undefined;
    bio () : TProfileData[ 'bio' ];
    cv () : string[];
    facts () : string[];
    related () : G.TRelation[];
    media () : G.TImage[];
}
