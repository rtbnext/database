import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';

export class WikiJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Wiki' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const profile = Profile.find( Parser.strict( this.args.profile ?? '', 'string' )! );
            if ( ! profile ) throw new Error( `Profile not found: ${this.args.profile}` );

            if ( this.truthy( this.args.update ) ) await this.update( profile );
            else if ( typeof this.args.assign === 'string' ) await this.assign(
                profile, this.args.assign
            );
            else throw new Error( `No action specified` );
        } );
    }

}

jobRunner( WikiJob );
