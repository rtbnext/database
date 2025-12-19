import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TProfileData } from '@/types/profile';
import { CmpStr, CmpStrResult } from 'cmpstr';

CmpStr.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( /-(family|\d+)$/i, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStr.create( { metric: 'dice' } );
    private static readonly index = ProfileIndex.getInstance();

    private static findSimilar ( uri: string ) : string[] {
        return ProfileMerger.cmp.match< CmpStrResult[] >(
            [ ...ProfileMerger.index.getIndex().keys() ], uri, 0.6
        ).map( i => i.source );
    }

    public static mergeProfiles ( target: Profile, source: Profile ) : void {}

    public static findMatch ( data: Partial< TProfileData > ) : Profile | false {}

}
