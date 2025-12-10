import { Primitive } from 'devtypes/types/primitives';

export class Parser {

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

    public static money ( value: any ) : number {
        return this.number( value, 3 );
    }

}
