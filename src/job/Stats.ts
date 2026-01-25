import { TFilterList } from '@rtbnext/schema/src/model/filter';

import { Job, jobRunner } from '@/abstract/Job';
import { StatsGroup } from '@/core/Const';
import { IJob } from '@/interfaces/job';
import { Filter } from '@/model/Filter';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';
import { Stats } from '@/model/Stats';

export class StatsJob extends Job implements IJob {

    private readonly filter = Filter.getInstance();
    private readonly stats = Stats.getInstance();

    constructor ( args: string[] ) {
        super( args, 'Stats' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const date = this.stats.getGlobalStats().date;
            const index = ProfileIndex.getInstance().getIndex();
            if ( ! date || ! index.size ) throw new Error( `No data available` );

            this.log( `Generating stats for ${date} with ${index.size} profiles` );
            const filter: Partial< TFilterList > = {}, stats: any = {};

            for ( const item of index.values() ) {
                const profile = Profile.getByItem( item );
                if ( ! profile ) continue;

                const data = profile.getData();
                Stats.aggregate( data, date, stats );
                Filter.aggregate( data, filter );
            }

            this.log( `Saving stats for ${date}` );
            this.filter.save( filter );
            this.stats.setProfileStats( stats.profile );
            this.stats.generateWealthStats( stats.scatter );
            StatsGroup.forEach( g => this.stats.setGroupedStats( g, stats.groups[ g ] ) );
            this.stats.setScatter( stats.scatter );
            this.stats.generateDBStats();

            this.log( `Stats generation completed` );
        } );
    }

}

jobRunner( StatsJob );
