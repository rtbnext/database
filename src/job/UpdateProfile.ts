import { Job, jobRunner } from '@/abstract/Job';
import { Profile, ProfileParser } from '@/collection/Profile';
import { TArgs } from '@/types/generic';

export class UpdateProfile extends Job {

    protected override readonly job = 'FetchProfile';

    public async run ( args: TArgs ) : Promise< void > {
        this.catch( async () => {
            const batch = 'profile' in args && typeof args.profile === 'string'
                ? args.profile.split( ',' ).filter( Boolean )
                : this.queue.nextUri( 'profile', this.config.fetch.rateLimit.maxBatchSize );

            for ( const row of await this.fetch.profile( ...batch ) ) {
                if ( ! row || ! row.success || ! row.data ) {
                    this.log( 'Request failed', row, 'warn' );
                    continue;
                }

                const parser = new ProfileParser( row.data );
                const uri = parser.uri();
                let profile: Profile| false;

                if ( profile = Profile.find( uri ) ) {
                    this.log( `Updating profile: ${uri}` );

                    profile.updateData( {
                        uri, info: parser.info(), bio: parser.bio(),
                        related: parser.related(), media: parser.media()
                    } );
                    profile.save();

                    if ( uri !== profile.getUri() ) {
                        // rename if uri has changed
                    }
                } else {
                    this.log( `Creating profile: ${uri}` );
                    // create new profile
                }
            }
        } );
    }

}

jobRunner( UpdateProfile );
