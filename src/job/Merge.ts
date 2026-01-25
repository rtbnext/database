import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';
import { Profile } from '@/model/Profile';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class MergeJob extends Job implements IJob {

    constructor ( args: string[] ) {
        super( args, 'Merge' );
    }

    private listMergeable ( ...uriLike: any[] ) : void {
        for ( const [ uri, list ] of Object.entries( ProfileMerger.listCandidates( uriLike ) ) ) {
            console.log( `Candidates for ${uri}:` );
            if ( ! list.length ) console.log( ' - None' );
            for ( const candidate of list ) console.log( ` - ${candidate}` );
        }
    }

    private isMergeable ( target: Profile, source: Profile ) : void {
        const test = ProfileMerger.mergeableProfiles( target.getData(), source.getData() );
        if ( test ) console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are mergeable.` );
        else console.log( `Profiles ${ target.getUri() } and ${ source.getUri() } are NOT mergeable.` );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( MergeJob );
