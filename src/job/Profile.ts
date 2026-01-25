import { TProfileData } from '@rtbnext/schema/src/model/profile';

import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';

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
                const aliases = parser.aliases();
                const profileData: Partial< TProfileData > = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    related: parser.related(), media: parser.media()
                };
            }
        } );
    }

}

jobRunner( ProfileJob );
