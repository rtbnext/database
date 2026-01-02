import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
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

}
