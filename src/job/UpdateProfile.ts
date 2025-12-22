import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { ProfileParser } from '@/utils/ProfileParser';
import { Wiki } from '@/utils/Wiki';

export class UpdateProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateProfile' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            // Determine batch of profile URIs to process
            const batch = 'profile' in args && typeof args.profile === 'string'
                ? args.profile.split( ',' ).filter( Boolean )
                : this.queue.nextUri( 'profile', this.config.fetch.rateLimit.maxBatchSize );

            // Loop through profile URIs
            for ( const row of await this.fetch.profile( ...batch ) ) {
                if ( ! row?.success || ! row.data ) {
                    this.log( 'Request failed', row, 'warn' );
                    continue;
                }

                // Parse profile data
                const parser = new ProfileParser( row.data );
                const uri = parser.uri();
                const id = parser.id();
                const aliases = parser.aliases();
                const profileData: Partial< TProfileData > = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    related: parser.related(), media: parser.media(),
                };

                // Fetch wiki data
                if ( ! args.skipWiki ) {
                    const wiki = await Wiki.profile( profileData );
                    if ( wiki ) profileData.wiki = wiki;
                }

                // Update or create profile entry
                let profile: Profile | false;

                if ( ( profile = Profile.find( uri ) ) && profile.verify( id ) ) {
                    // Existing profile, update data
                    this.log( `Updating profile: ${uri}` );
                    profile.updateData( profileData, aliases );
                    profile.save();

                    if ( uri !== profile.getUri() ) {
                        // URI has changed, move profile
                        this.log( `Renaming profile from ${ profile.getUri() } to ${uri}` );
                        profile.move( uri, true );
                    }
                } else if ( profile = ProfileMerger.findMatch( profileData ) ) {
                    // Similar profile found, merge data
                    this.log( `Merging new data into existing profile: ${ profile.getUri() }` );
                    profile.updateData( profileData, aliases );
                    profile.move( uri, true );
                } else {
                    // New profile, create entry
                    this.log( `Creating profile: ${uri}` );
                    Profile.create( uri, { ...profileData, ...{
                        map: [], ranking: [], annual: [], assets: []
                    } } as TProfileData, [], aliases );
                }
            }
        } );
    }

}

/**
 * UpdateProfile Job
 * node ./dist/job/UpdateProfile.ts [silent?] [safeMode?] [--profile=uri1,uri2,...] [--skipWiki]
 * @param silent Whether to suppress log output
 * @param safeMode Whether to enable safe mode
 * @param profile Comma-separated list of profile URIs to update
 * @param skipWiki Whether to skip fetching wiki data
 */
jobRunner( UpdateProfile );
