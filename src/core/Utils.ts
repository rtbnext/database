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

}
