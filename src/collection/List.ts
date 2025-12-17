import { ListIndex } from '@/collection/ListIndex';
import { Storage } from '@/core/Storage';
import { TListIndexItem } from '@/types/list';
import { Parser } from '@/utils/Parser';
import { join } from 'node:path';

export class List {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ListIndex.getInstance();

    private readonly uri: string;
    private readonly path: string;
    private data: TListIndexItem;
    private dates: string[];

    private constructor ( item?: TListIndexItem ) {
        if ( ! item ) throw new Error( `List index item not given` );

        this.uri = item.uri;
        this.path = join( 'list', item.uri );
        this.data = item;
        this.dates = List.storage.scanDir( this.path );
    }

    public getUri () : string {
        return this.uri;
    }

    public getData () : TListIndexItem {
        return this.data;
    }

    public getDates () : string[] {
        return this.dates;
    }

    public availableDate ( dateLike: string ) : boolean {
        return this.dates.includes( Parser.date( dateLike )! );
    }

    public latestDate () : string | undefined {
        return this.dates.sort().reverse()[ 0 ];
    }

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().sort().reduce(
            ( nearest, date ) => date > target ? nearest : date
        );
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

}
