/**
 * ManageQueue Job
 * 
 * node ./dist/job/ManageQueue.ts [silent?] [safeMode?] [--queue=type] [--clear] [--add=taskUri] [--args=jsonArgs] [--prio=number]
 * @arg silent Whether to suppress log output
 * @arg safeMode Whether to enable safe mode
 * @arg queue Type of queue to manage (default: 'profile')
 * @arg clear Whether to clear the specified queue
 * @arg add URI of the task to add to the queue
 * @arg args JSON-encoded arguments for the task being added
 * @arg prio Priority of the task being added
 */

import { Job, jobRunner } from '@/abstract/Job';
import { TArgs } from '@/types/generic';
import { Parser } from '@/utils/Parser';
import { QueueType } from '@/utils/Const';

export class ManageQueue extends Job {

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'ManageQueue' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const type = args.queue as QueueType;
            if ( ! QueueType.includes( type ) ) throw new Error( `Invalid queue type provided: ${ type }` );

            if ( Parser.boolean( args.clear ) ) this.queue.clear( type );
            else if ( typeof args.add === 'string' ) this.queue.add(
                type, args.add, typeof args.args === 'string' ? JSON.parse( args.args ) : undefined,
                Parser.strict( args.prio, 'number' )
            )
        } );
    }

}

jobRunner( ManageQueue );
