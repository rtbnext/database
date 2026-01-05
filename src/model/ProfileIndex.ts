import { Index } from '@/abstract/Index';
import { log } from '@/core/Logger';
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

    public move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false {
        log.debug( `Moving profile index item from ${from} to ${to}` );
        return log.catch( () => {
            from = Utils.sanitize( from ), to = Utils.sanitize( to );
            const data = this.index.get( from ), test = this.find( to );
            if ( ! data || test.size > 1 ) throw new Error( 'Invalid move operation' );

            const foundKey = test.keys().next().value;
            if ( foundKey && foundKey !== from ) throw new Error( 'Destination already exists' );

            const item = { ...data, uri: to, aliases: makeAlias ? [
                ...data.aliases.filter( alias => alias !== to ), from
            ] : data.aliases };

            this.index.delete( from );
            this.index.set( to, item );
            this.saveIndex();

            return item;
        }, `Failed to move profile index item ${from} to ${to}` ) ?? false;
    }

    // Instantitate

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
