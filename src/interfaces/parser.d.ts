import { TParsedProfileName } from '@/types/parser';
import { TEducation, TSelfMade } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

export interface IProfileParser {
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : TParsedProfileName;
    info () : TProfileData[ 'info' ];
    citizenship () : string | undefined;
    education () : TEducation[];
    selfMade () : TSelfMade;
}
