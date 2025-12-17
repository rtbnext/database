import { TProfileData } from '@/types/profile';
import { TProfileResponse } from '@/types/response';

export class Profile {

    public static parser ( raw: TProfileResponse ) : Partial< TProfileData > {
        return {};
    }

}
