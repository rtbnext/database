import { Primitive } from 'devtypes/types/primitives';

export class Parser {

    public static mapper< T = any > ( obj: Record< string, {
        value: any, method: keyof typeof Parser, strict?: boolean, args?: any[]
    } > ) : T {
        return Object.fromEntries( Object.entries( obj ).map(
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

    public static enum< T extends string, L extends Record< string, T > > (
        list: L, value: any, fb: T | undefined = undefined, exactMatch: boolean = false
    ) : T | undefined {
        value = this.string( value ).toLowerCase();
        return Object.values( list ).find( v => {
            const test = this.string( v ).toLowerCase();
            return exactMatch ? value === test : (
                value.includes( test ) || test.includes( value )
            );
        } ) || fb;
    }

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

}
