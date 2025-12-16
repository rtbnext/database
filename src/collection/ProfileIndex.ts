import { Index } from '@/abstract/Index';
import { TProfileIndex, TProfileIndexItem } from '@/types/profile';

export class ProfileIndex extends Index< TProfileIndex > {

    protected static instance: ProfileIndex;

    private constructor () {
        super();
    }

    protected loadIndex () : TProfileIndex {
        const raw = this.storage.readJSON< Record< string, TProfileIndexItem > > ( 'profile/index.json' ) || {};
        return new Map( Object.entries( raw ) );
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
