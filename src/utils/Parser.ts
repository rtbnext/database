import { TLocation } from '@/types/generic';
import * as Const from '@/utils/Const';
import { Primitive } from 'devtypes/types/primitives';
import { getAlpha2Code } from 'i18n-iso-countries';
import { abbr } from 'us-state-converter';

interface ContainerEntry {
    value: any;
    method: keyof typeof Parser;
    strict?: boolean;
    args?: any[];
};

export class Parser {

    // Helper

    public static container< T = any > ( obj: { [ K in keyof T ]: ContainerEntry } ) : T {
        return Object.fromEntries( Object.entries< ContainerEntry >( obj ).map(
            ( [ key, { value, method, strict = true, args } ] ) => [
                key, strict ? Parser.strict( value, method, ...( args || [] ) )
                    : ( Parser as any )[ method ]( value, ...( args || [] ) )
            ]
        ) ) as T;
    }

    public static strict< T = any > (
        value: any, method: keyof typeof Parser, ...args: any
    ) : T | undefined {
        return value === null || value === undefined ? undefined
            : ( Parser as any )[ method ]( value, ...args ) as T;
    }

    public static primitive ( value: any ) : Primitive {
        return value === null || value === undefined ? value
            : typeof value === 'boolean' ? value
            : ! isNaN( Number( value ) ) && value !== '' ? Parser.number( value )
            : Parser.string( value );
    }

    public static list ( value: any, delimiter: string = ',' ) : Primitive[] {
        const list = Array.isArray( value ) ? value : value.split( delimiter );
        return list.map( Parser.primitive ).filter( Boolean );
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
        return String( value ).trim().replace( /\s+/g, ' ' );
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

    public static date ( value: any, format: 'ymd' | 'iso' = 'ymd' ) : string | undefined {
        const date = new Date( value );
        return isNaN( date.getTime() ) ? undefined
            : format === 'iso' ? date.toISOString()
            : date.toISOString().split( 'T' )[ 0 ];
    }

    public static latLng ( lat: any, lng: any ) : [ number, number ] | undefined {
        const latitude = Parser.number( lat, 6 );
        const longitude = Parser.number( lng, 6 );
        return isNaN( latitude ) || isNaN( longitude ) ? undefined
            : [ latitude, longitude ];
    }

    public static cleanStr ( value: any, allowedTags?: string[] ) : string {
        return Parser.string( value ).replace( new RegExp( allowedTags?.length
            ? `<\\/?(?!(${ allowedTags.join( '|' ) })\\b)(\\w+)([^>]*)>` : '<[^>]*>', 'gi'
        ), '' ).replace( /\s+/g, ' ' ).trim();
    }

    public static decodeURI ( value: any ) : string {
        return decodeURIComponent( Parser.string( value ) );
    }

    // Special

    public static name (
        value: any, lastName: any = undefined, firstName: any = undefined,
        asianFormat: boolean = false
    ) : {
        name: string, shortName: string,
        lastName: string, firstName: string,
        family: boolean
    } {
        const clean = Parser.string( value ).replace( /&\s*family/i, '' ).trim();
        const family = /&\s*family/i.test( value );
        const parts = clean.split( /\s+/ ).filter( Boolean );

        const fN = firstName ? Parser.string( firstName ) : (
            asianFormat ? parts.slice( 1 ).join( ' ' ) : parts.slice( 0, -1 ).join( ' ' )
        );
        const lN = lastName ? Parser.string( lastName ) : (
            asianFormat ? parts[ 0 ] || '' : parts.pop() || ''
        );

        return {
            name: clean + ( family ? ' & family' : '' ),
            shortName: `${ fN.split( ' ' )[ 0 ] } ${lN}`.trim(),
            lastName: lN, firstName: fN, family
        };
    }

    public static age ( value: any ) : number | undefined {
        const date = new Date( value );
        return isNaN( date.getTime() ) ? undefined
            : new Date( Date.now() - date.getTime() ).getUTCFullYear() - 1970;
    }

    public static gender ( value: any ) : Const.Gender | undefined {
        return Parser.map< Const.Gender, typeof Const.Gender >( value, Const.Gender );
    }

    public static maritalStatus ( value: any ) : Const.MaritalStatus | undefined {
        return Parser.map< Const.MaritalStatus, typeof Const.MaritalStatusResolver >(
            value, Const.MaritalStatusResolver
        );
    }

    public static industry ( value: any ) : Const.Industry {
        return Parser.map< Const.Industry, typeof Const.IndustryResolver >(
            value, Const.IndustryResolver, 'diversified'
        )!;
    }

    public static country ( value: any ) : string | undefined {
        const code = getAlpha2Code( Parser.string( value ), 'en' );
        return code ? code.toLowerCase() : undefined;
    }

    public static state ( value: any ) : string | undefined {
        return value ? abbr( Parser.string( value ) ).toLowerCase() : undefined;
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

}
