import { Index } from '@/abstract/Index';
import { Utils } from '@/core/Utils';
import { IProfileIndex } from '@/interfaces/index';
import { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile', 'profile/index.json' );
    }

    // Special profile index operations

    public find ( uriLike: string ) : TProfileIndex {
        const uri = Utils.sanitize( uriLike );
        return new Map( [ ...this.index ].filter( ( [ key, { aliases } ] ) =>
            key === uri || aliases.includes( uri )
        ) );
    }

    // Instantitate

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
