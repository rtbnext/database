import { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Profile } from '@/model/Profile';
import { TProfileLookupResult, TProfileOperation } from '@/types/utils';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class ProfileManager {

    // Lookup profile by URI and ID, or find a similar matching profile

    public static lookup (
        uriLike: string, id?: string, profileData?: Partial< TProfileData >
    ) : TProfileLookupResult {
        let profile = Profile.find( uriLike );
        const isExisting = profile && profile.verify( id ?? '' );
        const isSimilar = ! isExisting && !! (
            profile = ProfileMerger.findMatching( profileData ?? {} )[ 0 ]
        );

        return { profile, isExisting, isSimilar };
    }

    // Determine action based on profile lookup

    public static determineAction ( lookup: TProfileLookupResult ) : TProfileOperation {
        return lookup.isExisting ? 'update' : lookup.isSimilar ? 'merge' : 'create';
    }

    // Prevent instantiation

    private constructor () {}

}
