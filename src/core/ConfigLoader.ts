import { Config, LoggingConfig } from '@/types/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { parse } from 'yaml';

export class ConfigLoader {

    private static instance: ConfigLoader;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: Config;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfigFile();
    }

    private loadConfigFile () : Config {
        [ `${ this.env }.yml`, 'default.yml' ].forEach( file => {
            const path = join( this.path, file );
            if ( existsSync( path ) ) return parse( readFileSync( path, 'utf8' ) ) as Config;
        } );
        throw new Error( 'No configuration file found' );
    }

    public get environment () : string { return this.env }
    public get config () : Config { return this.cfg }
    public get logging () : LoggingConfig { return this.cfg.logging }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
