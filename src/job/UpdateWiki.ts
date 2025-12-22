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
        const wiki = await Wiki.profile( profile.getData() );
        if ( ! wiki ) return;

        profile.updateData( { wiki } );
        profile.save();
    }

    private async assign ( profile: Profile, title: string ) : Promise< void > {
        this.log( `Assigning wiki page "${title}" to profile: ${ profile.getUri() }` );
        const wiki = await Wiki.queryWikiPage( title );
        if ( ! wiki ) return;

        wiki.image = await Wiki.queryWikiImage( wiki.uri );
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

/**
 * UpdateWiki Job
 * node ./dist/job/UpdateWiki.ts [silent?] [safeMode?] --profile=uri [--check] [--update] [--assign=title]
 * @param silent Whether to suppress log output
 * @param safeMode Whether to enable safe mode
 * @param profile Profile URI to update
 * @param check|update Whether to check for wiki updates
 * @param assign Title of wiki page to assign
 */
jobRunner( UpdateWiki );
