import { Gender, IndustryResolver, MaritalStatusResolver } from '@/core/Const';
import { REGEX_SPACES } from '@/core/RegEx';
import { TIndustryResolver, TMaritalStatusResolver } from '@/types/generic';
import { TGender, TIndustry, TMaritalStatus } from '@rtbnext/schema/src/abstract/const';
import { TLocation } from '@rtbnext/schema/src/abstract/generic';
import { Primitive } from 'devtypes/types/primitives';
import { getAlpha2Code } from 'i18n-iso-countries';
import { abbr } from 'us-state-converter';

export type TParserMethod = keyof typeof Parser;

export interface TParserContainer {
    value: any;
    type: TParserMethod;
    strict?: boolean;
    args?: any[];
}

export class Parser {

    // Container

    public static container< T = any > ( obj: { [ K in keyof T ]: TParserContainer } ) : T {
        return Object.fromEntries( Object.entries< TParserContainer >( obj ).map(
            ( [ key, { value, type, strict = true, args } ] ) => [
                key, type === 'container' ? value
                    : strict ? Parser.strict( value, type, ...( args || [] ) )
                    : ( Parser as any )[ type ]( value, ...( args || [] ) )
        ] ) ) as T;
    }

    // Helper

    public static strict< T = any > (
        value: any, method: TParserMethod, ...args: any
    ) : T | undefined {
        return value === null || value === undefined ? undefined
            : ( Parser as any )[ method ]( value, ...args ) as T;
    }

    public static primitive ( value: any, clean: boolean = true ) : Primitive {
        return value === null || value === undefined ? value
            : typeof value === 'boolean' ? value
            : ! isNaN( Number( value ) ) && value !== '' ? Parser.number( value )
            : clean ? Parser.safeStr( value ) : Parser.string( value );
    }

    public static list< T extends string | ( string | number | undefined )[] > (
        value: T | T[], type: TParserMethod = 'primitive', delimiter: string = ',',
        strict: boolean = true, ...args: any
    ) : T[] {
        return ( Array.isArray( value ) ? value : value.split( delimiter ) ).map(
            i => strict ? Parser.strict( value, type, ...( args || [] ) )
                : ( Parser as any )[ type ]( i, ...( args || [] ) )
        ).filter( Boolean ) as T[];
    }

    public static obj< T = any > (
        value: T, type: TParserMethod = 'primitive',
        strict: boolean = true, ...args: any
    ) : T {
        if ( typeof value !== 'object' || value === null ) return {} as T;
        return Object.fromEntries( Object.entries( value ).map( ( [ k, v ] ) => [
            k, strict ? Parser.strict( v, type, ...( args || [] ) )
                : ( Parser as any )[ type ]( v, ...( args || [] ) )
        ] ) ) as T;
    }

    public static map<
        T extends Primitive,
        L extends readonly T[] | Record< string | number, T >
    > (
        value: any, list: L, fb: T | undefined = undefined,
        exactMatch: boolean = false, useKey?: boolean
    ) : T | undefined {
        if ( useKey === undefined ) useKey = ! Array.isArray( list );
        value = Parser.string( value ).toLowerCase();
        return Object.entries( list ).find( ( [ k, v ] ) => {
            const test = Parser.string( useKey ? k : v ).toLowerCase();
            return exactMatch ? value === test : (
                value.includes( test ) || test.includes( value )
            );
        } )?.[ 1 ] || fb;
    }

    // Primitive

    public static string ( value: any ) : string {
        return String( value ).trim().replace( REGEX_SPACES, ' ' );
    }

    public static safeStr ( value: any, allowedTags?: string[] ) : string {
        return Parser.string( value ).replace( new RegExp( allowedTags?.length
            ? `<\\/?(?!(${ allowedTags.join( '|' ) })\\b)(\\w+)([^>]*)>` : '<[^>]*>', 'gi'
        ), '' ).replace( REGEX_SPACES, ' ' ).trim();
    }

    public static boolean ( value: any ) : boolean {
        const truthyValues = [ '1', 'true', 'yes', 'y' ];
        return value !== null && value !== undefined && (
            typeof value === 'boolean' ? value : truthyValues.includes(
                Parser.string( value ).toLowerCase()
            )
        );
    }

    public static number ( value: any, digits: number = 0 ) : number {
        return Number( Number( value ).toFixed( digits ) );
    }

    public static money ( value: any ) : number {
        return Parser.number( value, 3 );
    }

    public static pct ( value: any, digits: number = 2 ) : number {
        return Parser.number( value, digits );
    }

    public static date (
        value: any, format: 'ymd' | 'iso' | 'y' | 'ym' = 'ymd'
    ) : string | undefined {
        try { value = new Date( value ).toISOString() } catch { return undefined; }
        return format === 'iso' ? value : value.split( '-' ).slice( 0, format.length ).join( '-' );
    }

    // URI component

    public static decodeURI ( value: any ) : string {
        return decodeURIComponent( Parser.string( value ) );
    }

    public static encodeURI ( value: any ) : string {
        return encodeURIComponent( Parser.string( value ) );
    }

    // Profile

    public static age ( value: any ) : number | undefined {
        const date = new Date( value );
        return isNaN( date.getTime() ) ? undefined
            : new Date( Date.now() - date.getTime() ).getUTCFullYear() - 1970;
    }

    public static ageDecade (
        value: any, min: number = 30, max: number = 90
    ) : number | undefined {
        const age = Parser.age( value );
        return age === undefined ? undefined : Math.max(
            min, Math.min( max, Math.floor( age / 10 ) * 10 )
        );
    }

    public static gender ( value: any ) : TGender | undefined {
        return Parser.map( value, Gender );
    }

    public static maritalStatus ( value: any ) : TMaritalStatus | undefined {
        return Parser.map< TMaritalStatus, TMaritalStatusResolver >(
            value, MaritalStatusResolver
        );
    }

    public static industry ( value: any ) : TIndustry {
        return Parser.map< TIndustry, TIndustryResolver >(
            value, IndustryResolver, 'diversified'
        )!;
    }

    // Location

    public static country ( value: any ) : string | undefined {
        const code = getAlpha2Code( Parser.string( value ), 'en' );
        return code ? code.toUpperCase() : undefined;
    }

    public static state ( value: any ) : string | undefined {
        return value ? abbr( Parser.string( value ) ).toUpperCase() : undefined;
    }

    public static latLng ( lat: any, lng: any ) : [ number, number ] | undefined {
        const latitude = Parser.number( lat, 6 );
        const longitude = Parser.number( lng, 6 );
        return isNaN( latitude ) || isNaN( longitude ) ? undefined
            : [ latitude, longitude ];
    }

    public static location (
        value: { country: any, state?: any, city?: any }
    ) : TLocation | undefined {
        const country = Parser.country( value.country );
        return country ? {
            country, state: Parser.state( value.state ),
            city: Parser.strict( value.city, 'string' )
        } : undefined;
    }

    // Prevent instantiation

    private constructor () {}

}
