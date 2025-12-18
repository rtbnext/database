import helper from '@/utils';

export abstract class Job {}

export function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run', ci: string = '--run',
    options: { silent: boolean, safeMode: boolean }, 
) : void {
    if ( ! process.argv.includes( ci ) ) return;
    const { silent = false, safeMode = false } = options;
    try {
        const job = new ( cls as any )( silent, safeMode );
        ( job[ method ] as Function )();
    } catch ( err ) {
        if ( ! silent ) helper.log.error( `Job failed: ${ ( err as Error ).message }`, err as Error );
        if ( ! safeMode ) throw err;
    }
}
