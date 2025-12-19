import { Profile } from '@/collection';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TProfileData } from '@/types/profile';
import { CmpStr } from 'cmpstr';

export class ProfileMerger {

    private static readonly cmp = CmpStr.create( { metric: 'levenshtein' } );
    private static readonly index = ProfileIndex.getInstance();

    public static mergeProfiles ( target: Profile, source: Profile ) : void {}

    public static findMatch ( data: Partial< TProfileData > ) : Profile | false {}

}
