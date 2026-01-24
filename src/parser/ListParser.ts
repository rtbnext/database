import { IListParser } from '@/interfaces/parser';
import { TListResponse } from '@/types/response';

export type TListResponseEntry = TListResponse[ 'personList' ][ 'personsLists' ][ number ];

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

}
