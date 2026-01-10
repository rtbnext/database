import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';

export class StatsJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Stats' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const date = Job.stats.getGlobalStats().date;
            const index = ProfileIndex.getInstance().getIndex();
            if ( ! date || ! index.size ) throw new Error( `No data available` );

            let filter = {}, stats = {};

            for ( const item of index.values() ) {
                const profile = Profile.getByItem( item );
                if ( ! profile ) continue;

                const data = profile.getData();
                Stats.aggregate( data, date, stats );
                Filter.aggregate( data, filter );
            }
        } );
    }

}

jobRunner( StatsJob );
