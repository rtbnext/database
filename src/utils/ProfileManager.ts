import { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Profile } from '@/model/Profile';
import { TQueueOptions } from '@/types/queue';
import { TProfileLookupResult, TProfileOperation } from '@/types/utils';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class ProfileManager {

    // Private helpers

    private static execute (
        lookup: TProfileLookupResult, uriLike: string, profileData: Partial< TProfileData >,
        aliases: string[] = [], method: 'setData' | 'updateData' = 'updateData'
    ) : Profile | false {
        const { profile, isExisting, isSimilar } = lookup;

        if ( isExisting && profile ) {
            profile[ method ]( profileData as any, aliases );
            profile.save();
            return profile;
        }

        if ( isSimilar && profile ) {
            profile[ method ]( profileData as any, aliases );
            profile.move( uriLike, true );
            return profile;
        }

        return Profile.create( uriLike, profileData as TProfileData, [], aliases );
    }

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

    // Handle URI change

    public static handleURIChange ( profile: Profile, newUri: string, makeAlias: boolean = true ) : boolean {
        return profile.getUri() !== newUri ? profile.move( newUri, makeAlias ) : false;
    }

    // Perform profile operation

    public static process (
        uriLike: string, id: string, profileData: Partial< TProfileData >,
        aliases: string[] = [], method: 'setData' | 'updateData' = 'updateData'
    ) : { profile: Profile | false; action: TProfileOperation } {
        const lookup = this.lookup( uriLike, id, profileData );
        const action = this.determineAction( lookup );
        const profile = this.execute( lookup, uriLike, profileData, aliases, method );

        if ( profile && action !== 'create' ) this.handleURIChange( profile, uriLike );
        return { profile, action };
    }

    // Add queue item based on action

    public static updateQueue (
        queue: TQueueOptions[], profile: Profile, action: TProfileOperation, th?: number
    ) : void {
        const uriLike = profile.getUri();

        switch ( action ) {
            case 'update': if ( ! th || profile.modifiedTime() < th ) queue.push( { uriLike } ); break;
            case 'merge': queue.push( { uriLike, prio: 5 } ); break;
            case 'create': queue.push( { uriLike, prio: 10 } ); break;
        }
    }

    // Prevent instantiation

    private constructor () {}

}
