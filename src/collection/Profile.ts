import { TProfileData } from '@/types/profile';
import { TProfileResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
import { DeepPartial } from 'devtypes/types/collections';

export class Profile {

    public static parser ( raw: TProfileResponse[ 'person' ] ) : DeepPartial< TProfileData > {
        return {
            uri: Utils.sanitize( raw.uri ),
            info: {
                ...Parser.name( raw.name, raw.lastName, raw.firstName, Parser.boolean( raw.asianFormat ) ),
                ...Parser.container< Partial< TProfileData[ 'info' ] > >( {
                    deceased: { value: raw.deceased, method: 'boolean' },
                    dropOff: { value: raw.dropOff, method: 'boolean' },
                    embargo: { value: raw.embargo, method: 'boolean' },
                    gender: { value: raw.gender, method: 'gender' },
                    birthDate: { value: raw.birthDate, method: 'date' },
                    birthPlace: { value: { country: raw.birthCountry, state: raw.birthState, city: raw.birthCity }, method: 'location' },
                    citizenship: { value: raw.countryOfCitizenship || raw.countryOfResidence, method: 'country' },
                    residence: { value: { country: raw.countryOfResidence, state: raw.stateProvince, city: raw.city }, method: 'location' },
                    maritalStatus: { value: raw.maritalStatus, method: 'maritalStatus' },
                    children: { value: raw.numberOfChildren, method: 'number' },
                    industry: { value: raw.industries, method: 'industry' },
                    source: { value: raw.source, method: 'list' }
                } )
            }
        };
    }

}
