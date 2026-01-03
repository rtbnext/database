import { Utils } from '@/core/Utils';
import { TConfigObject } from '@/types/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process, { cwd } from 'node:process';
import deepmerge from 'deepmerge';
import { parse } from 'yaml';

export class Config {

    private static instance: Config;
    private readonly cwd: string;
    private readonly path: string;
    private readonly env: string;
    private readonly cfg: TConfigObject;

    private constructor () {
        this.cwd = cwd();
        this.path = join( this.cwd, 'config' );
        this.env = process.env.NODE_ENV || 'production';
        this.cfg = this.loadConfig();
    }

    private loadConfigFile ( path: string ) : Partial< TConfigObject > {
        if ( ! existsSync( path = join( this.path, path ) ) ) return {};
        try { return parse( readFileSync( path, 'utf8' ) ) as Partial< TConfigObject > }
        catch { return {} }
    }

    private loadConfig () : TConfigObject {
        return deepmerge< TConfigObject >(
            this.loadConfigFile( 'default.yml' ), this.loadConfigFile( `${this.env}.yml` ),
            { arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'replace' ) }
        );
    }

    public get root () : string { return this.cwd }
    public get environment () : string { return this.env }
    public get config () : TConfigObject { return this.cfg }

    public static getInstance () : Config {
        return Config.instance ||= new Config();
    }

}
