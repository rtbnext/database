import { CmpStrAsync } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/core/RegEx';
import { ProfileIndex } from '@/model/ProfileIndex';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( REGEX_URI_CLEANUP, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
    private static readonly index = ProfileIndex.getInstance();

    // Prevent instantiation

    private constructor () {}

}
