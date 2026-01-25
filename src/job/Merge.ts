import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';
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

    public async run () : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( MergeJob );
