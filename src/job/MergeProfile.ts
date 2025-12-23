import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';

export class MergeProfile extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'MergeProfile' );
    }

    private listMergeable () : void {}

    private isMergeable () : void {}

    private async merge () : Promise< void > {}

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {} );
    }

}

jobRunner( MergeProfile );
