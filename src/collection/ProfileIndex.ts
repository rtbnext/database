import { Index } from '@/abstract/Index';
import { TProfileIndex, TProfileIndexItem } from '@/types/profile';
import { Utils } from '@/utils/Utils';

export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile/index.json' );
    }

    public find ( uriLike: string ) : TProfileIndex {
        const uri = Utils.sanitize( uriLike );
        return new Map( [ ...this.index ].filter( ( [ key, { aliases } ] ) =>
            key === uri || aliases.includes( uri )
        ) );
    }

    public move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false {
        from = Utils.sanitize( from ), to = Utils.sanitize( to );
        const data = this.index.get( from ), test = this.find( to );
        if ( ! data || test.size > 1 ) return false;

        const foundKey = test.keys().next().value;
        if ( foundKey && foundKey !== from ) return false;

        const item = { ...data, uri: to, aliases: makeAlias ? [
            ...data.aliases.filter( alias => alias !== to ), from
        ] : data.aliases };

        this.index.delete( from );
        this.index.set( to, item );
        this.saveIndex();

        return item;
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
