import { Gender, Industry, MaritalStatus } from '@/utils/Const';
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
            ( [ key, { value, method, strict, args } ] ) => [
                key, strict ? this.strict( value, method, ...( args || [] ) )
                    : ( this as any )[ method ]( value, ...( args || [] ) )
            ]
        ) ) as T;
    }

    public static strict< T = any > (
        value: any, method: keyof typeof Parser, ...args: any
    ) : T | undefined {
        return value === null || value === undefined ? undefined
            : ( this as any )[ method ]( value, ...args ) as T;
    }

    public static primitive ( value: any ) : Primitive {
        return value === null || value === undefined ? value
            : typeof value === 'boolean' ? value
            : ! isNaN( Number( value ) ) && value !== '' ? this.number( value )
            : this.string( value );
    }

    public static list ( value: any, delimiter: string = ',' ) : Primitive[] {
        const list = Array.isArray( value ) ? value : value.split( delimiter );
        return list.map( this.primitive ).filter( Boolean );
    }

    public static map< T extends Primitive, L extends readonly T[] | Record< string | number, T > > (
        list: L, value: any, fb: T | undefined = undefined,
        exactMatch: boolean = false, useKey: boolean = true
    ) : T | undefined {
        value = this.string( value ).toLowerCase();
        return Object.entries( list ).find( ( [ k, v ] ) => {
            const test = this.string( useKey ? k : v ).toLowerCase();
            return exactMatch ? value === test : (
                value.includes( test ) || test.includes( value )
            )
        } )?.[ 1 ] || fb;
    }

    // Primitive

    public static string ( value: any ) : string {
        return String( value ).trim();
    }

    public static boolean ( value: any ) : boolean {
        const truthyValues = [ '1', 'true', 'yes', 'y' ];
        return value !== null && value !== undefined && (
            typeof value === 'boolean' ? value : truthyValues.includes(
                this.string( value ).toLowerCase()
            )
        );
    }

    public static number ( value: any, digits: number = 0 ) : number {
        return Number( Number( value ).toFixed( digits ) );
    }

    public static money ( value: any ) : number {
        return this.number( value, 3 );
    }

    public static date ( value: any, format: 'ymd' | 'iso' = 'ymd' ) : string | undefined {
        const date = new Date( value );
        return isNaN( date.getTime() ) ? undefined
            : format === 'iso' ? date.toISOString()
            : date.toISOString().split( 'T' )[ 0 ];
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
        const clean = this.string( value ).replace( /&\s*family/i, '' ).trim();
        const family = /&\s*family/i.test( value );
        const parts = clean.split( /\s+/ ).filter( Boolean );

        const fN = firstName ? this.string( firstName ) : (
            asianFormat ? parts.slice( 1 ).join( ' ' ) : parts.slice( 0, -1 ).join( ' ' )
        );
        const lN = lastName ? this.string( lastName ) : (
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

    public static gender ( value: any ) : Gender | undefined {
        return this.map< Gender, typeof Gender >( Gender, value );
    }

    public static maritalStatus ( value: any ) : MaritalStatus | undefined {
        return this.map< MaritalStatus, typeof MaritalStatus >( MaritalStatus, value );
    }

    public static industry ( value: any ) : Industry {
        return this.map< Industry, typeof Industry >( Industry, value, 'diversified' )!;
    }

    public static country ( value: any ) : string | undefined {
        const code = getAlpha2Code( this.string( value ), 'en' );
        return code ? code.toLowerCase() : undefined;
    }

    public static state ( value: any ) : string | undefined {
        return value ? abbr( this.string( value ) ).toLowerCase() : undefined;
    }

}
