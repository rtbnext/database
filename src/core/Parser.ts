import * as Const from '@rtbnext/schema/src/abstract/const';
import { DateString } from '@rtbnext/schema/src/abstract/primitives';
import { getAlpha2Code } from 'i18n-iso-countries';

export const Industry = ( [
    'automotive', 'casinos', 'diversified', 'energy', 'engineering', 'finance',
    'foodstuff', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as any ) as Const.Industry;

export class Parser {

    public static boolean ( value: any ) : boolean { return Boolean( value ) }
    public static number ( value: any, d = 0 ) : number { return Number( Number( value ).toFixed( d ) ) }
    public static string ( value: any ) : string { return String( value ).trim() }

    public static list ( value: any ) : string[] {

        return this.string( value ).split( ',' ).map(
            s => this.string( s )
        );

    }

    public static country ( value: any ) : Const.ISOCountryCode | undefined {

        const code = getAlpha2Code( Parser.string( value ), 'en' );
        if ( code ) return code.toLowerCase() as Const.ISOCountryCode;

    }

    public static state ( value: any ) : Const.USStateCode {

        //

    }

    public static industry ( value: any ) : Const.Industry {

        const i = this.string( value ).toLowerCase();
        if ( Industry.includes( i ) ) return i as Const.Industry;
        return 'diversified';

    }

    public static gender ( value: any ) : Const.Gender {

        switch ( this.string( value ).toLowerCase() ) {
            case 'm': return 'm';
            case 'f': return 'f';
            default: return 'd';
        }

    }

    public static birthDate ( value: any ) : DateString | undefined {

        if ( ! value ) return;
        return new Date( value ).toISOString().split( 'T' )[ 0 ] as DateString;

    }

    public static age ( value: any ) : number | undefined {

        if ( ! value ) return;
        const date = new Date( new Date().getTime() - new Date( value ).getTime() );
        return date.getFullYear() - 1970;

    }

}
