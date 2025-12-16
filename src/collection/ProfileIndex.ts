import { Index } from '@/abstract/Index';
import { TProfileIndex, TProfileIndexItem } from '@/types/profile';

export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile/index.json' );
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
