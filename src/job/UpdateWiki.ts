import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection';
import { TArgs } from '@/types/generic';

export class UpdateWiki extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateWiki' );
    }

    private async update ( profile: Profile ) : Promise< void > {}

    private async assign ( profile: Profile, title: string ) : Promise< void > {}

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const profile = Profile.find( ( args.profile ?? '' ) as string );
            if ( ! profile ) throw new Error( `Profile not found: ${args.profile}` );

            if ( args.check || args.update ) await this.update( profile );
            else if ( typeof args.assign === 'string' ) await this.assign( profile, args.assign );
        } );
    }

}

jobRunner( UpdateWiki );
