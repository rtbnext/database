import { TParsedProfileName } from '@/types/parser';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

export interface IProfileParser {
    uri () : string;
    id () : string;
    aliases () : string[];
    name () : TParsedProfileName;
    info () : TProfileData[ 'info' ];
}
