import { Config } from '@/core/Config';
import { TLoggingConfig } from '@/types/config';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export class Logger {

    private static instance: Logger;
    private readonly config: TLoggingConfig;
    private readonly path: string;

    private constructor () {
        const { root, logging } = Config.getInstance();
        this.config = logging;
        this.path = join( root, 'logs' );
        mkdirSync( this.path, { recursive: true } );
    }

}
