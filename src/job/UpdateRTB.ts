import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { Stats } from '@/collection/Stats';
import { TArgs } from '@/types/generic';
import { TRTBResponse } from '@/types/response';
import { ProfileMerger } from '@/utils';
import { Parser } from '@/utils/Parser';

export class UpdateRTB extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateRTB' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const rtStats = this.stats.rt();
            const res = await this.fetch.list< TRTBResponse >( 'rtb', '0' );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const raw = res.data.personList.personsLists;
            const listDate = Parser.date( raw[ 0 ].date || raw[ 0 ].timestamp, 'ymd' )!;
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            rtStats.date = listDate;
            const items = [];

            for ( const row of raw ) {
                let profile = Profile.find( row.uri );
                const isExisting = profile && profile.verify( row.naturalId );
                const isSimilar = ! isExisting && ( profile = Profile.get(
                    ProfileMerger.listCandidates( row.uri )[ row.uri ][ 0 ]
                ) );
            }
        } );
    }

}

jobRunner( UpdateRTB );
