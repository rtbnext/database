import { join } from 'node:path';
import { load } from 'js-yaml';

export interface ConfigObject {
    storage: {
        baseDir: string;
        minify: boolean;
        fileExtensions: boolean;
        compression: boolean;
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
        };
    };
}

export class Config {

    private static instance: Config;
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

            const path = join( Config.cwd, 'config', ( process.env.ENV ?? 'default' ) + '.yml' );
            return load( path ) as ConfigObject;

        } catch ( err ) { throw new Error(
            `Failed to load configuration: ${err}`
        ) }

    }

    public getConfig () : ConfigObject { return this.config }
    public getStorageConfig () : ConfigObject[ 'storage' ] { return this.config.storage }
    public getAPIConfig () : ConfigObject[ 'api' ] { return this.config.api }

}
