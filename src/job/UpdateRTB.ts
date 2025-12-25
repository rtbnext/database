import { Job, jobRunner } from '@/abstract/Job';
import { Stats } from '@/collection/Stats';
import { TArgs } from '@/types/generic';
import { TRTBSnapshot } from '@/types/list';
import { TRTBResponse } from '@/types/response';
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
            const items: TRTBSnapshot[ 'items' ] = [];

            for ( const row of raw ) {
                const data: TRTBSnapshot[ 'items' ][ number ] = {
                    uri: row.uri,
                    name: row.person?.name ?? row.personName,
                    rank: row.rank,
                    networth: row.finalWorth,
                    gender: row.gender,
                    age: row.birthDate,
                    citizenship: row.countryOfCitizenship,
                    industry: row.industries,
                    source: row.source
                };
            }
        } );
    }

}

jobRunner( UpdateRTB );
