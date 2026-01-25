import { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { Wiki } from '@/core/Wiki';
import { IJob } from '@/interfaces/job';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import { Ranking } from '@/utils/Ranking';
import { ProfileManager } from '@/utils/ProfileManager';

export class ProfileJob extends Job implements IJob {

    private static readonly fetch = Fetch.getInstance();
    private static readonly queue = ProfileQueue.getInstance();

    constructor ( args: string[] ) {
        super( args, 'Profile' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const method = Parser.boolean( this.args.replace ) ? 'setData' : 'updateData';
            const batch = 'profile' in this.args && typeof this.args.profile === 'string'
                ? this.args.profile.split( ',' ).filter( Boolean )
                : ProfileJob.queue.nextUri( Job.config.fetch.rateLimit.batchSize );

            for ( const raw of await ProfileJob.fetch.profile( ...batch ) ) {
                if ( ! raw?.success || ! raw.data ) {
                    this.log( 'Request failed', raw, 'warn' );
                    continue;
                }

                const parser = new ProfileParser( raw.data );
                const uri = parser.uri();
                const id = parser.id();
                const profileData: Partial< TProfileData > = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    related: parser.related(), media: parser.media()
                };

                // Enrich profile data with ranking and wiki
                if ( ! Parser.boolean( this.args.skipRanking ) ) {
                    profileData.ranking = Ranking.generateProfileRanking(
                        parser.sortedLists(), profileData.ranking
                    );
                }

                if ( ! Parser.boolean( this.args.skipWiki ) ) {
                    const lookup = ProfileManager.lookup( uri, id, profileData );
                    const wiki = lookup.profile && lookup.profile.getData().wiki;
                    profileData.wiki = wiki ? await Wiki.queryWikiPage( wiki.uri )
                        : await Wiki.fromProfileData( profileData );
                }

                // Process profile using ProfileManager
                const { profile, action } = ProfileManager.process(
                    uri, id, profileData, parser.aliases(), method
                );
            }
        } );
    }

}

jobRunner( ProfileJob );
