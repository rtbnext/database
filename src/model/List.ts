import { TListIndexItem, TListSnapshot } from '@rtbnext/schema/src/model/list';

import { Snapshot } from '@/abstract/Snapshot';
import { log } from '@/core/Logger';
import { IList } from '@/interfaces/list';
import { ListIndex } from '@/model/ListIndex';

export class List extends Snapshot< TListSnapshot > implements IList {

    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private item: TListIndexItem;

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        super( 'list', 'json' );
        this.uri = item.uri;
        this.item = item;
    }

    // Getters

    public getUri () : string {
        return this.uri;
    }

    public getItem () : TListIndexItem {
        return this.item;
    }

    // Save list snapshot

    public saveSnapshot ( snapshot: TListSnapshot, force: boolean = false ) : boolean {
        const res = super.saveSnapshot( snapshot, force );
        if ( ! res || ! List.index.update( this.uri, {
            date: snapshot.date,
            count: snapshot.stats.count
        } ) ) return false;

        this.item.date = snapshot.date;
        this.item.count = snapshot.stats.count;
        return true;
    }

    // Instantiate

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

    // Create new list

    public static create (
        uriLike: any, data: TListIndexItem, snapshot?: TListSnapshot
    ) : List | false {
        log.debug( `Creating List ${uriLike}` );
        return log.catch( () => {
            const item = List.index.add( uriLike, data );
            if ( ! item ) throw new Error( `List index item for ${uriLike} could not be created` );

            const list = new List( item );
            if ( ! list ) throw new Error( `List ${item.uri} could not be created` );

            if ( snapshot ) list.saveSnapshot( snapshot );
            return list;
        }, `Failed to create List ${uriLike}` ) ?? false;
    }

}
