import { ListLike } from 'devtypes/types/lists';

export class Base {

    public static sanitize ( value: any, delimiter: string = '-' ) : string {
        return String( value ).toLowerCase().trim().replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter );
    }

    public static sort< L extends ListLike >(
        value: L, compare?: ( a: any, b: any ) => -1 | 0 | 1
    ) : L {
        compare ||= ( a, b ) => ( a > b ? 1 : a < b ? -1 : 0 );
        const keys = ( a: any, b: any ) => compare( a[ 0 ], b[ 0 ] );

        return ( Array.isArray( value ) ? [ ...value ].sort( compare )
            : value instanceof Set ? new Set( [ ...value ].sort( compare ) )
            : value instanceof Map ? new Map( [ ...value.entries() ].sort( keys ) )
            : typeof value === 'object' ? Object.fromEntries( Object.entries( value ).sort( keys ) )
            : [ ...value as Iterable< any > ].sort( compare )
        ) as L;
    }

}
