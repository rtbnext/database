import { Job, jobRunner } from '@/abstract/Job';
import { Stats } from '@/collection/Stats';
import { TArgs } from '@/types/generic';
import { TRTBResponse } from '@/types/response';

export class UpdateRTB extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateRTB' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const rtStats = this.stats.rt();
            const res = await this.fetch.list< TRTBResponse >( 'rtb', '0' );
        } );
    }

}

jobRunner( UpdateRTB );
