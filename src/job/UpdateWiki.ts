/**
 * UpdateWiki Job
 * 
 * node ./dist/job/UpdateWiki.ts [silent?] [safeMode?] --profile=uri [--check] [--update] [--assign=title]
 * @arg silent Whether to suppress log output
 * @arg safeMode Whether to enable safe mode
 * @arg profile Profile URI to update
 * @arg check|update Whether to check for wiki updates
 * @arg assign Title of wiki page to assign
 */

import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { Wiki } from '@/utils/Wiki';

export class UpdateWiki extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateWiki' );
    }

    private async update ( profile: Profile ) : Promise< void > {
        this.log( `Updating wiki for profile: ${ profile.getUri() }` );
        const wiki = await Wiki.fromProfileData( profile.getData() );
        if ( ! wiki ) return;

        profile.updateData( { wiki } );
        profile.save();
    }

    private async assign ( profile: Profile, title: string ) : Promise< void > {
        this.log( `Assigning wiki page "${title}" to profile: ${ profile.getUri() }` );
        const wiki = await Wiki.queryWikiPage( title );
        if ( ! wiki ) return;

        profile.updateData( { wiki } );
        profile.save();
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const profile = Profile.find( ( args.profile ?? '' ) as string );
            if ( ! profile ) throw new Error( `Profile not found: ${args.profile}` );

            if ( args.check || args.update ) await this.update( profile );
            else if ( typeof args.assign === 'string' ) await this.assign( profile, args.assign );
        } );
    }

}

jobRunner( UpdateWiki );
