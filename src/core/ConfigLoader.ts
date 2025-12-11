import * as config from '@/types/config';
import { Helper } from '@/utils/Helper';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import deepmerge from 'deepmerge';
import { parse } from 'yaml';

export class ConfigLoader {

    private static instance: ConfigLoader;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: config.ConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfig();
    }

    private loadConfigFile ( path: string ) : Partial< config.ConfigObject > {
        if ( ! existsSync( path = join( this.path, path ) ) ) return {};
        try { return parse( readFileSync( path, 'utf8' ) ) as Partial< config.ConfigObject > }
        catch { return {} }
    }

    private loadConfig () : config.ConfigObject {
        return deepmerge< config.ConfigObject >(
            this.loadConfigFile( 'default.yml' ), this.loadConfigFile( `${this.env}.yml` ),
            { arrayMerge: ( t, s ) => Helper.mergeArray( t, s, 'replace' ) }
        );
    }

    public get environment () : string { return this.env }
    public get config () : config.ConfigObject { return this.cfg }
    public get fetch () : config.FetchConfig { return this.cfg.fetch }
    public get storage () : config.StorageConfig { return this.cfg.storage }
    public get logging () : config.LoggingConfig { return this.cfg.logging }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
