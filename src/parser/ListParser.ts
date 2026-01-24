import { IListParser } from '@/interfaces/parser';
import { TListResponse } from '@/types/response';

export class ListParser implements IListParser {

    private readonly raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ];
    private cachedData: Map< string, any > = new Map();

    constructor ( raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ] ) {
        this.raw = raw;
    }

    // Caching

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

}
