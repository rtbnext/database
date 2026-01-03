import { TConfigObject } from '@/types/config';
import { join } from 'node:path';
import { cwd } from 'node:process';

export class Config {

    private static instance: Config;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly config: TConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
    }

}
