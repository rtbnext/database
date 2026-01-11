import { Job, jobRunner } from '@/abstract/Job';
import { Wiki } from '@/core/Wiki';
import { IJob } from '@/interfaces/job';
import { Profile } from '@/model/Profile';
import { Parser } from '@/parser/Parser';

export class WikiJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Wiki' );
    }

    private async update ( profile: Profile ) : Promise< void > {
        this.log( `Updating wiki for profile: ${ profile.getUri() }` );
        const wiki = await Wiki.fromProfileData( profile.getData() );
        if ( ! wiki ) return;

        profile.updateData( { wiki } );
        profile.save();
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
