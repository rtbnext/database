import { TArgs } from '@/types/generic';
import { ListLike } from 'devtypes/types/lists';
import { hrtime } from 'node:process';
import { sha256 } from 'js-sha256';

export class Utils {

    public static sanitize ( value: any, delimiter: string = '-' ) : string {
        return String( value ).toLowerCase().trim().replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter );
    }

    public static hash ( value: any ) : string {
        return sha256( String( value ) );
    }

    public static verifyHash ( value: any, hash: string ) : boolean {
        return value === hash || Utils.hash( value ) === hash;
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

    public static unique< T = any > ( arr: T[] ) : T[] {
        return Array.from( new Set( arr.map( item => JSON.stringify( item ) ) ) )
            .map( item => JSON.parse( item ) );
    }

    public static mergeArray< T = any > (
        target: T[], source: T[], mode: 'concat' | 'replace' | 'unique' = 'unique'
    ) : T[] {
        switch ( mode ) {
            case 'concat': return [ ...target, ...source ];
            case 'replace': return source;
            case 'unique': return Utils.unique< T >( [ ...target, ...source ] );
        }
    }

    public static aggregate<
        T extends Record< PropertyKey, unknown >,
        K extends keyof T = keyof T, R = unknown
    > (
        arr: readonly T[], key: K, aggregator:
            | 'first' | 'last' | 'all' | 'sum' | 'min' | 'max' | 'avg'
            | ( ( values: readonly T[ K ][] ) => R ) = 'first'
    ) : T[ K ] | T[ K ][] | number | R | undefined {
        const values = arr.map( item => item[ key ] ).filter(
            ( v ): v is T[ K ] => v !== undefined
        );

        if ( ! values.length ) return undefined;
        if ( typeof aggregator === 'function' ) return aggregator( values );

        const sum = ( acc: number | undefined, val: T[ K ] ) : number | undefined => (
            acc === undefined || typeof val !== 'number' ? undefined : acc + val
        );

        switch ( aggregator ) {
            case 'first': return values[ 0 ];
            case 'last': return values.at( -1 );
            case 'all': return values;
            case 'sum': return values.reduce< number | undefined >( sum, 0 );
            case 'min': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
                acc === undefined || val < acc! ? val : acc
            ), Infinity as unknown as T[ K ] );
            case 'max': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
                acc === undefined || val > acc! ? val : acc
            ), -Infinity as unknown as T[ K ] );
            case 'avg':
                const s = values.reduce< number | undefined >( sum, 0 );
                return s === undefined ? undefined : s / values.length;
        }
    }

    public static buildSearchText ( value: any ) : string {
        return Array.from( new Set( String( value )
            .normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' ).toLowerCase()
            .replace( /[^a-z0-9]+/g, ' ' ).split( ' ' ).filter( w => w.length > 3 )
        ) ).join( ' ' );
    }

    public static search ( text: string, query: string, exactMatch: boolean = false ) : boolean {
        text = Utils.sanitize( text ), query = Utils.sanitize( query );
        return exactMatch ? text.includes( query )
            : query.split( '-' ).every( q => text.includes( q ) );
    }

    public static queryStr ( query: Record< string, any > ) : string {
        return new URLSearchParams( query ).toString();
    }

    public static parseArgs ( args: readonly string[] ) : TArgs {
        return args.reduce( ( res, a, i ) => {
            if ( a.startsWith( '--' ) ) {
                const [ key, val ] = a.slice( 2 ).split( '=', 2 );
                res[ key ] = val ?? ( args[ i + 1 ]?.startsWith( '--' ) ? true : args[ ++i ] );
            }
            return res;
        }, {} as TArgs );
    }

    public static async measure<
        F extends ( ...args: any[] ) => any,
        R = Awaited< ReturnType< F > >
    > ( fn: F ) : Promise< { result: R; ms: number } > {
        if ( typeof fn !== 'function' ) throw new TypeError( 'Parameter must be a function' );

        const now = hrtime.bigint();
        const diff = () => Number( hrtime.bigint() - now ) / 1e6;

        try { return { result: await fn() as R, ms: diff() } }
        catch ( err ) { throw Object.assign( err ?? {}, { ms: diff() } ) }
    }

}
