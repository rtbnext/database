import { Utils } from '@/core/Utils';
import { IListParser } from '@/interfaces/parser';
import { Parser } from '@/parser/Parser';
import { TListResponseEntry } from '@/types/response';

export class ListParser implements IListParser {

    private readonly raw: TListResponseEntry;
    private cachedData: Map< string, any > = new Map();

    constructor ( raw: TListResponseEntry ) {
        this.raw = raw;
    }

    // Caching

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    // Raw data

    public rawData () : TListResponseEntry {
        return this.raw;
    }

    // URIs & IDs

    public uri () : string {
        return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
    }

    public id () : string {
        return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
    }

    // Parse basic fields

    public date () : string {
        return this.cache( 'date', () =>
            Parser.date( this.raw.date || this.raw.timestamp, 'ymd' )!
        );
    }

    public rank () : number | undefined {
        return this.cache( 'rank', () => Parser.strict( this.raw.rank, 'number' ) );
    }

    public networth () : number | undefined {
        return this.cache( 'networth', () =>
            Parser.strict( this.raw.finalWorth, 'money' )
        );
    }

    public dropOff () : boolean | undefined {
        return this.cache( 'dropOff', () =>
            this.raw.finalWorth ? this.raw.finalWorth < 1e3 : undefined
        );
    }

}
