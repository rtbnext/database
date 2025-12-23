import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';

export class ManageQueue extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'ManageQueue' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( ManageQueue );
