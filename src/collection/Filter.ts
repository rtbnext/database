import { Storage } from '@/core/Storage';
import { TFilter, TFilterCollection, TFilterList } from '@/types/filter';
import { FilterGroup, FilterSpecial } from '@/utils/Const';
import { Utils } from '@/utils/Utils';

export class Filter {

    private static instance: Filter;
    private static readonly storage = Storage.getInstance();

    private data: Partial< TFilterCollection > = {};

    private constructor () {
        for ( const group of FilterGroup ) Filter.storage.ensurePath( `filter/${group}`, true );
    }

    private saveFilter ( path: string, list: TFilter[] ) : void {
        const items = [ ...new Map( list.map( i => [ i.uri, i ] ) ).values() ].sort(
            ( a, b ) => a.uri.localeCompare( b.uri )
        );

        Filter.storage.writeJSON< TFilterList >( `filter/${path}.json`, {
            ...Utils.metaData(), items, count: items.length
        } );
    }

    private saveGroup ( group: FilterGroup, data: Record< string | number, TFilter[] > ) : void {
        for ( const [ k, list ] of Object.entries( data ) ) this.saveFilter( `${group}/${k}`, list );
    }

    private saveSpecial ( special: FilterSpecial, data: TFilter[] ) : void {
        this.saveFilter( `special/${special}`, data );
    }

    public save ( collection: Partial< TFilterCollection > ) : void {
        for ( const group of FilterGroup ) if ( collection[ group ] )
            this.saveGroup( group, collection[ group ] );
        for ( const special of FilterSpecial ) if ( collection.special?.[ special ] )
            this.saveSpecial( special, collection.special[ special ] );
    }

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
