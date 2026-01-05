import { Index } from '@/abstract/Index';
import { IProfileIndex } from '@/interfaces/index';
import { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile', 'profile/index.json' );
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
