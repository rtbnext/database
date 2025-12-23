import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';
import { ProfileMerger } from '@/utils/ProfileMerger';

export class MergeProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'MergeProfile' );
    }

    private listMergeable ( ...uriLike: any[] ) : void {
        for ( const [ uri, candidates ] of Object.entries( ProfileMerger.listCandidates( uriLike ) ) ) {
            console.log( `Candidates for ${uri}:` );
            if ( ! candidates.length ) console.log( ' - None' );
            for ( const candidate of candidates ) console.log( ` - ${candidate}` );
        }
    }

    private isMergeable () : void {}

    private merge () : void {}

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            if ( typeof args.list === 'string' ) this.listMergeable(
                ...args.list.split( ',' ).filter( Boolean )
            )
        } );
    }

}

jobRunner( MergeProfile );
