import { join } from 'node:path';
import { load } from 'js-yaml';

export interface ConfigObject {
    storage: {
        baseDir: string;
        compression: boolean;
        fileExtensions: boolean;
        csvDelimiter: string;
    };
    api: {
        baseUrl: string;
        endpoints: {
            list: string;
            profile: string;
        };
        rateLimiting: {
            batch: number;
            timeout: number;
            delay: {
                max: number;
                min: number;
            };
        };
    };
}

export class Config {

    private static instance: Config;
    public static readonly env = process.env.NODE_ENV ?? 'default';
    public static readonly cwd = process.cwd();
    public readonly config: ConfigObject;

    private constructor () {

        this.config = this.loadConfig();

    }

    public static getInstance () : Config {

        if ( ! Config.instance ) Config.instance = new Config();
        return Config.instance;

    }

    private loadConfig () : ConfigObject {

        try {

            const path = join( Config.cwd, 'config', Config.env + '.yml' );
            return load( path ) as ConfigObject;

        } catch ( err ) { throw new Error(
            `Failed to load configuration: ${err}`
        ) }

    }

    public getConfig () : ConfigObject { return this.config }
    public getStorageConfig () : ConfigObject[ 'storage' ] { return this.config.storage }
    public getAPIConfig () : ConfigObject[ 'api' ] { return this.config.api }

}
