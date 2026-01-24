import { CmpStrAsync, CmpStrResult } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/core/RegEx';
import { ProfileIndex } from '@/model/ProfileIndex';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( REGEX_URI_CLEANUP, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
    private static readonly index = ProfileIndex.getInstance();

    private static similarURIs ( uri: string ) : string[] {
        const revUri = uri.split( '-' ).reverse().join( '-' );
        const keys = [ ...ProfileMerger.index.getIndex().keys() ];
        return [ ...new Set( [
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, uri, 0.9 ).map( i => i.source ),
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, revUri, 0.8 ).map( i => i.source )
        ] ) ];
    }

    // Prevent instantiation

    private constructor () {}

}
