import { ListLike } from 'devtypes/types/lists';
import { hrtime } from 'node:process';

export class Utils {

    public static sanitize ( value: any, delimiter: string = '-' ) : string {
        return String( value ).toLowerCase().trim().replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter );
    }

    public static sort< L extends ListLike > (
        value: L, compare?: ( a: any, b: any ) => -1 | 0 | 1,
        objCompare?: ( a: any, b: any ) => -1 | 0 | 1
    ) : L {
        compare ||= ( a, b ) => ( a > b ? 1 : a < b ? -1 : 0 );
        objCompare ||= ( a, b ) => compare( a[ 0 ], b[ 0 ] );

        return ( Array.isArray( value ) ? [ ...value ].sort( compare )
            : value instanceof Set ? new Set( [ ...value ].sort( compare ) )
            : value instanceof Map ? new Map( [ ...value.entries() ].sort( objCompare ) )
            : typeof value === 'object' ? Object.fromEntries(
                Object.entries( value ).sort( objCompare )
            )
            : [ ...value as Iterable< any > ].sort( compare )
        ) as L;
    }

    public static mergeArray< T = any > (
        target: T[], source: T[], mode: 'unique' | 'concat' | 'replace' = 'unique'
    ) : T[] {
        switch ( mode ) {
            case 'replace': return source;
            case 'concat': return [ ...target, ...source ];
            case 'unique': return Array.from( new Set(
                [ ...target, ...source ].map( item => JSON.stringify( item ) )
            ) ).map( item => JSON.parse( item ) );
        }
    }

    public static search ( text: string, query: string, exactMatch: boolean = false ) : boolean {
        text = this.sanitize( text ), query = this.sanitize( query );
        return exactMatch ? text.includes( query )
            : query.split( '-' ).every( q => text.includes( q ) );
    }

    public static async measure<
        F extends ( ...args: any[] ) => any,
        R = Awaited< ReturnType< F > >
    > ( fn: F ): Promise< { result: R; ms: number } > {
        if ( typeof fn !== 'function' ) throw new TypeError( 'Parameter must be a function' );

        const now = hrtime.bigint();
        const diff = () => Number( hrtime.bigint() - now ) / 1e6;

        try { return { result: await fn() as R, ms: diff() } }
        catch ( err ) { throw Object.assign( err ?? {}, { ms: diff() } ) }
    }

}
