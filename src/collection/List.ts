import { ListIndex } from '@/collection/ListIndex';
import { Storage } from '@/core/Storage';
import { TListIndexItem, TListSnapshot } from '@/types/list';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
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
        this.dates = Utils.sort( List.storage.scanDir( this.path ) );
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

    public firstDate () : string | undefined {
        return this.dates[ 0 ];
    }

    public latestDate () : string | undefined {
        return this.dates.at( -1 );
    }

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().reduce(
            ( nearest, date ) => date > target ? nearest : date
        );
    }

    public datesInRange ( from: string, to: string ) : string[] {
        const fromDate = Parser.date( from )!;
        const toDate = Parser.date( to )!;
        return this.dates.filter( date => date >= fromDate && date <= toDate );
    }

    public latestInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
    }

    public static get ( uriLike: string ) : List | false {
        try { return new List( List.index.get( uriLike ) ) }
        catch { return false }
    }

    public getSnapshot< T extends TListSnapshot > (
        dateLike: string, exactMatch: boolean = true
    ) : T | false {
        const target = Parser.date( dateLike )!;
        const date = this.availableDate( target ) ? target : exactMatch ? undefined : this.nearestDate( target );
        return date ? List.storage.readJSON< T >( join( this.path, `${date}.json` ) ) : false;
    }

    public getLatest< T extends TListSnapshot > () : T | false {
        return this.dates.length ? this.getSnapshot< T >( this.latestDate()! ) : false;
    }

    public saveSnapshot< T extends TListSnapshot > ( snapshot: T, force: boolean = false ) : boolean {
        if ( ! force && this.availableDate( snapshot.date ) ) return false;
        // renew list index item
        return List.storage.writeJSON< T >( join( this.path, `${snapshot.date}.json` ), snapshot );
    }

}
