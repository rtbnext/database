import { Dated } from '@/abstract/Dated';
import { ListIndex } from '@/collection/ListIndex';
import { TListIndexItem, TListSnapshot } from '@/types/list';

export class List extends Dated< TListSnapshot > {

    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private data: TListIndexItem;

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        super( `list/${item.uri}` );
        this.uri = item.uri;
        this.data = item;
    }

    public getUri () : string {
        return this.uri;
    }

    public getData () : TListIndexItem {
        return this.data;
    }

    public saveSnapshot ( date: string, snapshot: TListSnapshot, force: boolean = false ) : boolean {
        const res = super.saveSnapshot( date, snapshot, force );
        if ( ! res || ! List.index.update( this.uri, {
            date: snapshot.date,
            count: snapshot.stats.count
        } ) ) return false;

        this.data.date = snapshot.date;
        this.data.count = snapshot.stats.count;
        this.dates = this.scanDates();

        return true;
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

    public static create ( uriLike: any, data: TListIndexItem, snapshot?: TListSnapshot ) : List | false {
        const item = List.index.add( uriLike, data ); if ( ! item ) return false;
        const list = new List( item ); if ( ! list ) return false;
        if ( snapshot ) list.saveSnapshot( snapshot.date, snapshot );
        return list;
    }

}
