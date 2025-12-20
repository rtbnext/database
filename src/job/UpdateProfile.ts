import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { TArgs } from '@/types/generic';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { ProfileParser } from '@/utils/ProfileParser';

export class UpdateProfile extends Job {

    protected override readonly job = 'UpdateProfile';

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const batch = 'profile' in args && typeof args.profile === 'string'
                ? args.profile.split( ',' ).filter( Boolean )
                : this.queue.nextUri( 'profile', this.config.fetch.rateLimit.maxBatchSize );

            for ( const row of await this.fetch.profile( ...batch ) ) {
                if ( ! row?.success || ! row.data ) {
                    this.log( 'Request failed', row, 'warn' );
                    continue;
                }

                let profile: Profile | false;
                const parser = new ProfileParser( row.data );
                const uri = parser.uri();
                const id = parser.id();
                const aliases = parser.aliases();
                const profileData = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    related: parser.related(), media: parser.media()
                };

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
                    Profile.create( uri, {
                        ...profileData,
                        ...{ map: [], ranking: [], annual: [], assets: [] }
                    }, [], aliases );
                }
            }
        } );
    }

}

jobRunner( UpdateProfile );
