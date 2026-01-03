import { join } from 'node:path';
import { cwd } from 'node:process';

export class Config {

    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
    }

}
