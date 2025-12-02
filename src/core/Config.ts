import { join } from 'node:path';
import { load } from 'js-yaml';

export interface ConfigObject {
    storage: {
        baseDir: string;
        minify: boolean;
        csvDelimiter: string;
    };
}

export class Config {

    private static instance: Config;
    public static readonly cwd = process.cwd();
    private readonly config: ConfigObject;

    private constructor () { this.config = this.loadConfig() }

    public static getInstance () : Config {

        if ( ! Config.instance ) Config.instance = new Config();
        return Config.instance;

    }

    private loadConfig () : ConfigObject {

        try {

            const path = join( Config.cwd, 'config', 'default.yml' );
            return load( path ) as ConfigObject;

        } catch ( err ) { throw new Error(
            `Failed to load configuration: ${err}`
        ) }

    }

}
