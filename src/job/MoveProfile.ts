/**
 * MoveProfile Job
 * 
 * node ./dist/job/MoveProfile.ts [silent?] [safeMode?] --from=oldUri --to=newUri [--makeAlias]
 * @param silent Whether to suppress log output
 * @param safeMode Whether to enable safe mode
 * @param from The current profile URI
 * @param to The new profile URI
 * @param makeAlias Whether to create an alias from the old URI to the new URI
 */

import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class MoveProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'MoveProfile' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const from = typeof args.from === 'string' && Utils.sanitize( args.from );
            const to = typeof args.to === 'string' && Utils.sanitize( args.to );
            if( ! from || ! to ) throw new Error( 'Invalid from/to profile names' );

            const profile = Profile.find( from );
            if ( ! profile ) throw new Error( `Profile "${ from }" not found` );

            this.log( `Moving profile from "${ from }" to "${ to }"` );
            const res = profile.move( to, Parser.boolean( args.makeAlias ) );
            this.log( res ? `Profile moved successfully` : `Profile move failed` );
        } );
    }

}

jobRunner( MoveProfile );
