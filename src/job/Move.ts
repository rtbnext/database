import { Job, jobRunner } from '@/abstract/Job';
import { Utils } from '@/core/Utils';
import { IJob } from '@/interfaces/job';
import { Profile } from '@/model/Profile';

export class MoveJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Move' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const from = typeof this.args.from === 'string' && Utils.sanitize( this.args.from );
            const to = typeof this.args.to === 'string' && Utils.sanitize( this.args.to );
            if( ! from || ! to ) throw new Error( 'Invalid from/to profile names' );

            const profile = Profile.find( from );
            if ( ! profile ) throw new Error( `Profile ${from} not found` );
        } );
    }

}

jobRunner( MoveJob );
