import { Job, jobRunner } from '@/abstract/Job';
import { ProfileParser } from '@/collection/Profile';

export class FetchProfile extends Job {

    protected override readonly job = 'FetchProfile';

    public async run () : Promise< void > {
        const batch = this.queue.next( 'profile', this.config.fetch.rateLimit.maxBatchSize );
        const res = await this.fetch.profile( ...batch.map( i => i.uri ) );

        for ( const row of res ) {
            if ( ! row || ! row.success || ! row.data ) {
                this.log( 'Request failed', row, 'warn' );
                continue;
            }

            const parser = new ProfileParser( row.data );
        }
    }

    public async single () : Promise< void > {
        //
    }

}

jobRunner( FetchProfile );
jobRunner( FetchProfile, 'single', '--profile' );
