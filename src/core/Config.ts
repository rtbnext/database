import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process, { cwd } from 'node:process';

import deepmerge from 'deepmerge';
import { parse } from 'yaml';

import { Utils } from '@/core/Utils';
import { IConfig } from '@/interfaces/config';
import * as Conf from '@/types/config';

export class Config implements IConfig {

    private static instance: Config;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: Conf.TConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfig();
    }

    // Load config

    private loadConfigFile ( path: string ) : Partial< Conf.TConfigObject > {
        if ( ! existsSync( path = join( this.path, path ) ) ) return {};
        try { return parse( readFileSync( path, 'utf8' ) ) as Partial< Conf.TConfigObject > }
        catch { return {} }
    }

    private loadConfig () : Conf.TConfigObject {
        return deepmerge< Conf.TConfigObject >(
            this.loadConfigFile( 'default.yml' ), this.loadConfigFile( `${this.env}.yml` ),
            { arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'replace' ) }
        );
    }

    // Public getter

    public get root () : string { return this.cwd }
    public get environment () : string { return this.env }
    public get config () : Conf.TConfigObject { return this.cfg }
    public get logging () : Conf.TLoggingConfig { return this.cfg.logging }
    public get job () : Conf.TJobConfig { return this.cfg.job }
    public get storage () : Conf.TStorageConfig { return this.cfg.storage }
    public get fetch () : Conf.TFetchConfig { return this.cfg.fetch }
    public get queue () : Conf.TQueueConfig { return this.cfg.queue }

    // Instantiate

    public static getInstance () : Config {
        return Config.instance ||= new Config();
    }

}
