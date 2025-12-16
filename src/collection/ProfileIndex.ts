import { Index } from '@/abstract/Index';
import { TProfileIndex, TProfileIndexItem } from '@/types/profile';
import { Utils } from '@/utils';

export class ProfileIndex extends Index< TProfileIndex, TProfileIndexItem > {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile/index.json' );
    }
    
    protected saveIndex () : void {
        const content = Object.fromEntries( Utils.sort< TProfileIndex >( this.index ) );
        this.storage.writeJSON< Record< string, TProfileIndexItem > >( 'profile/index.json', content );
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
