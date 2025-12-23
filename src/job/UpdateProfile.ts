/**
 * UpdateProfile Job
 * 
 * node ./dist/job/UpdateProfile.ts [silent?] [safeMode?] [--profile=uri1,uri2,...] [--skipWiki]
 * @arg silent Whether to suppress log output
 * @arg safeMode Whether to enable safe mode
 * @arg profile Comma-separated list of profile URIs to update
 * @arg skipRanking Whether to skip ranking data generation
 * @arg skipWiki Whether to skip fetching wiki data
 * @arg replace Whether to replace profile data instead of merging
 */

import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { Parser } from '@/utils/Parser';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { ProfileParser } from '@/utils/ProfileParser';
import { Ranking } from '@/utils/Ranking';
import { Wiki } from '@/utils/Wiki';

export class UpdateProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateProfile' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const method = Parser.boolean( args.replace ) ? 'setData' : 'updateData';
            const batch = 'profile' in args && typeof args.profile === 'string'
                ? args.profile.split( ',' ).filter( Boolean )
                : this.queue.nextUri( 'profile', this.config.fetch.rateLimit.maxBatchSize );

            for ( const row of await this.fetch.profile( ...batch ) ) {
                if ( ! row?.success || ! row.data ) {
                    this.log( 'Request failed', row, 'warn' );
                    continue;
                }

                const parser = new ProfileParser( row.data );
                const uri = parser.uri();
                const id = parser.id();
                const aliases = parser.aliases();
                const profileData: Partial< TProfileData > = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    related: parser.related(), media: parser.media()
                };

                let profile = Profile.find( uri );
                const isExisting = profile && profile.verify( id );
                const isSimilar = ! isExisting && ( profile = ProfileMerger.findMatching( profileData )[ 0 ] );
                const wiki = profile && profile.getData().wiki;

                if ( ! Parser.boolean( args.skipWiki ) ) profileData.wiki = wiki
                    ? await Wiki.queryWikiPage( wiki.uri )
                    : await Wiki.fromProfileData( profileData );

                if ( ! Parser.boolean( args.skipRanking ) ) profileData.ranking =
                    Ranking.generateProfileRanking(
                        row.data.person.personLists,
                        profileData.ranking
                    );

                if ( isExisting && profile ) {
                    this.log( `Updating profile: ${uri}` );
                    profile[ method ]( profileData as any, aliases );
                    profile.save();

                    if ( uri !== profile.getUri() ) {
                        this.log( `Renaming profile from ${ profile.getUri() } to ${uri}` );
                        profile.move( uri, true );
                    }
                } else if ( isSimilar && profile ) {
                    this.log( `Merging new data into existing profile: ${ profile.getUri() }` );
                    profile[ method ]( profileData as any, aliases );
                    profile.move( uri, true );
                } else {
                    this.log( `Creating profile: ${uri}` );
                    Profile.create( uri, profileData as TProfileData, [], aliases );
                }
            }
        } );
    }

}

jobRunner( UpdateProfile );
