import { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

import { Index } from '@/abstract/Index';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import { IProfileIndex } from '@/interfaces/index';

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

    // Alias operations

    public hasAlias ( alias: string ) : string | false {
        alias = Utils.sanitize( alias );
        return [ ...this.index.values() ].find(
            ( { aliases } ) => aliases.includes( alias )
        )?.uri || false;
    }

    public removeAlias ( alias: string ) : boolean {
        alias = Utils.sanitize( alias );
        log.debug( `Removing profile alias ${alias}` );
        return log.catch( () => {
            for ( const item of this.index.values() ) {
                const index = item.aliases.indexOf( alias );
                if ( index >= 0 ) {
                    item.aliases.splice( index, 1 );
                    this.saveIndex();
                    return true;
                }
            }
            return false;
        }, `Failed to remove profile alias ${alias}` ) ?? false;
    }

    public addAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false {
        const uri = Utils.sanitize( uriLike );
        log.debug( `Adding profile aliases [${ aliases.join( ', ' ) }] to ${uri}` );
        return log.catch( () => {
            const item = this.index.get( uri );
            if ( ! item ) throw new Error( `Profile index item ${uri} not found` );
            item.aliases = Utils.mergeArray( item.aliases, aliases, 'unique' );
            this.saveIndex();
            return item;
        }, `Failed to add profile aliases to ${uri}` ) ?? false;
    }

    public rmvAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false {
        const uri = Utils.sanitize( uriLike );
        log.debug( `Removing profile aliases [${ aliases.join( ', ' ) }] from ${uri}` );
        return log.catch( () => {
            const item = this.index.get( uri );
            if ( ! item ) throw new Error( `Profile index item ${uri} not found` );
            item.aliases = item.aliases.filter( alias => ! aliases.includes( alias ) );
            this.saveIndex();
            return item;
        }, `Failed to remove profile aliases from ${uri}` ) ?? false;
    }

    // Instantitate

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
