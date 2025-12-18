import { Job, jobRunner } from '@/abstract/Job';
import { ProfileParser } from '@/collection/Profile';
import { TArgs } from '@/types/generic';

export class FetchProfile extends Job {

    protected override readonly job = 'FetchProfile';

    public async run ( args: TArgs ) : Promise< void > {
        const batch = 'profile' in args && typeof args.profile === 'string'
            ? args.profile.split( ',' ).filter( Boolean ).map( i => ( { uri: i } ) )
            : this.queue.next( 'profile', this.config.fetch.rateLimit.maxBatchSize );

        for ( const row of await this.fetch.profile( ...batch.map( i => i.uri ) ) ) {
            if ( ! row || ! row.success || ! row.data ) {
                this.log( 'Request failed', row, 'warn' );
                continue;
            }

            const parser = new ProfileParser( row.data );
            // create or update profile
        }
    }

}

jobRunner( FetchProfile );
