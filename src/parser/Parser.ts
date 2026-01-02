export class Parser {

    // Helper

    public static strict< T = any > (
        value: any, method: keyof typeof Parser, ...args: any
    ) : T | undefined {
        return value === null || value === undefined ? undefined
            : ( Parser as any )[ method ]( value, ...args ) as T;
    }

    // Primitive

    public static string ( value: any ) : string {
        return String( value ).trim().replace( /\s+/g, ' ' );
    }

    public static safeStr ( value: any, allowedTags?: string[] ) : string {
        return Parser.string( value ).replace( new RegExp( allowedTags?.length
            ? `<\\/?(?!(${ allowedTags.join( '|' ) })\\b)(\\w+)([^>]*)>` : '<[^>]*>', 'gi'
        ), '' ).replace( /\s+/g, ' ' ).trim();
    }

    public static boolean ( value: any ) : boolean {
        const truthyValues = [ '1', 'true', 'yes', 'y' ];
        return value !== null && value !== undefined && (
            typeof value === 'boolean' ? value : truthyValues.includes(
                Parser.string( value ).toLowerCase()
            )
        );
    }

}
