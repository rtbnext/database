import { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Profile } from '@/model/Profile';
import { TProfileLookupResult } from '@/types/utils';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class ProfileManager {

    public static lookup ( uri: string, id: string, profileData: Partial< TProfileData > ) : TProfileLookupResult {
        let profile = Profile.find( uri );
        const isExisting = profile && profile.verify( id );
        const isSimilar = ! isExisting && !! ( profile = ProfileMerger.findMatching( profileData )[ 0 ] );

        return { profile, isExisting, isSimilar };
    }

}
