import { TArgs } from '@/types/generic';
import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import { ListLike } from 'devtypes/types/lists';
import { sha256 } from 'js-sha256';

export class Utils {

    public static sanitize ( value: any, delimiter: string ) : string {
        return String( value ).toLowerCase().trim().replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter );
    }

    public static hash ( value: any ) : string {
        return sha256( String( value.split( '/' ).pop() ) );
    }

    public static verifyHash ( value: any, hash: string ) : boolean {
        return value === hash || Utils.hash( value ) === hash;
    }

    public static metaData () : TMetaData {
        return { '@metadata': { schemaVersion: 2, lastModified: new Date().toISOString() } };
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
