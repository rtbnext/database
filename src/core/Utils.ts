export class Utils {

    public static sanitize ( value: any, delimiter: string ) : string {
        return String( value )
            .toLowerCase()
            .replace( /[^a-z0-9]/g, delimiter )
            .replace( new RegExp( `[${delimiter}]{2,}`, 'g' ), delimiter )
            .trim();
    }

}
