import { Parser } from '@/parser/Parser';
import { TAggregator, TArgs, TMeasuredResult } from '@/types/generic';
import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { hrtime } from 'node:process';
import { ListLike } from 'devtypes/types/lists';
import { sha256 } from 'js-sha256';

export class Utils {

    private static metadata: TMetaData;

    // Sanitize IDs and URIs

    public static sanitize ( value: any, delimiter: string ) : string {
        return Parser.string( value ).toLowerCase().replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter );
    }

    // Hashing

    public static hash ( value: any ) : string {
        return sha256( Parser.string( value.split( '/' ).pop() ) );
    }

    public static verifyHash ( value: any, hash: string ) : boolean {
        return value === hash || Utils.hash( value ) === hash;
    }

    // Measurement

    public static async measure<
        F extends ( ...args: any[] ) => any,
        R = Awaited< ReturnType< F > >
    > ( fn: F ) : Promise< TMeasuredResult< R > > {
        if ( typeof fn !== 'function' ) throw new TypeError( 'Parameter must be a function' );

        const now = hrtime.bigint();
        const diff = () => Number( hrtime.bigint() - now ) / 1e6;

        try { return { result: await fn() as R, ms: diff() } }
        catch ( err ) { throw Object.assign( err ?? {}, { ms: diff() } ) }
    }

    // Meta data

    public static metaData ( force: boolean = false ) : TMetaData {
        if ( force ) Utils.metadata = undefined!;
        return Utils.metadata ||= { '@metadata': {
            schemaVersion: 2,
            lastModified: new Date().toISOString()
        } };
    }

    // Aggregate from object arrays

    public static aggregate<
        T extends Record< PropertyKey, unknown >,
        K extends keyof T = keyof T, R = unknown
    > (
        arr: readonly T[], key: K, aggregator: TAggregator = 'first'
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
            case 'all': return values;
            case 'first': return values[ 0 ];
            case 'last': return values.at( -1 );
            case 'sum': return values.reduce< number | undefined >( sum, 0 );
            case 'min': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
                acc === undefined || val < acc! ? val : acc
            ), Infinity as unknown as T[ K ] );
            case 'max': return values.reduce< T[ K ] | undefined >( ( acc, val ) => (
                acc === undefined || val > acc! ? val : acc
            ), -Infinity as unknown as T[ K ] );
            case 'mean':
                const s = values.reduce< number | undefined >( sum, 0 );
                return s === undefined ? undefined : s / values.length;
        }
    }

    // Sorting arrays and objects

    public static sort< L extends ListLike > (
        value: L, compare?: ( a: any, b: any ) => number,
        objCompare?: ( a: any, b: any ) => number
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

    public static sortKeysDeep< T >( value: T, exclude: ReadonlySet< string > = new Set() ) : T {
        if ( value === null || typeof value !== 'object' ) return value;
        if ( Array.isArray( value ) ) return value.map( v => Utils.sortKeysDeep( v, exclude ) ) as any;

        return Object.keys( value )
            .sort( ( a, b ) => exclude.has( a ) || exclude.has( b ) ? 0 : a.localeCompare( b ) )
            .reduce( ( acc, k ) => {
                acc[ k ] = Utils.sortKeysDeep( ( value as any )[ k ], exclude );
                return acc;
            }, {} as any );
    }

    // Array merging

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

    // Queries & args

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

    // Search index

    public static buildSearchText ( value: any, minLength: number = 4 ) : string {
        return Array.from( new Set( String( value )
            .normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' )
            .toLowerCase().replace( /[^a-z0-9]+/g, ' ' ).split( ' ' )
            .filter( w => w.length >= minLength ).filter( Boolean )
        ) ).join( ' ' );
    }

    public static tokenSearch (
        text: string, tokens: string[], looseMatch: boolean = false
    ) : boolean {
        if ( ! text || ! tokens.length ) return false;
        return tokens[ looseMatch ? 'some' : 'every' ]( t => text.includes( t ) );
    }

}
