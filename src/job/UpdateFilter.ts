import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TArgs } from '@/types/generic';

export class UpdateFiler extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateFilter' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            for ( const item of ProfileIndex.getInstance().getIndex().values() ) {
                const profile = Profile.getByItem( item );
                if ( ! profile ) continue;
                // ...
            }
        } );
    }

}

jobRunner( UpdateFiler );
