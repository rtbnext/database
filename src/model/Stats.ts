import { StatsGroup } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IStats } from '@/interfaces/stats';
import { Parser } from '@/parser/Parser';
import * as S from '@rtbnext/schema/src/model/stats';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export class Stats implements IStats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {
        this.initDB();
    }

    private initDB () : void {
        log.debug( 'Initializing stats storage paths' );
        StatsGroup.forEach( group => Stats.storage.ensurePath( this.resolvePath( group ), true ) );
    }

    // Private helper

    private resolvePath ( path: string ) : string {
        return join( 'stats', path );
    }

    private prepStats< T >( data: Partial< T > ) : T {
        return { ...data, ...Utils.metaData() } as T;
    }

    private getStats< T > ( path: string, format: 'json' | 'csv' ) : T {
        return ( ( Stats.storage[ format === 'csv' ? 'readCSV' : 'readJSON' ] as any )
            ( this.resolvePath( path ) ) || ( format === 'csv' ? [] : {} ) ) as T;
    }

    private saveStats< T > ( path: string, format: 'json' | 'csv', data: T ) : boolean {
        return ( Stats.storage[ format === 'csv' ? 'writeCSV' : 'writeJSON' ] as any )
            ( this.resolvePath( path ), data );
    }

    // Stats getter

    public getGlobalStats () : S.TGlobalStats {
        return this.getStats< S.TGlobalStats >( 'global.json', 'json' );
    }

    public getDBStats () : S.TDBStats {
        return this.getStats< S.TDBStats >( 'db.json', 'json' );
    }

    public getHistory () : S.THistory {
        return this.getStats< S.THistory >( 'history.csv', 'csv' );
    }

    public getProfileStats () : S.TProfileStats {
        return this.getStats< S.TProfileStats >( 'profile.json', 'json' );
    }

    public getWealthStats () : S.TWealthStats {
        return this.getStats< S.TWealthStats >( 'wealth.json', 'json' );
    }

    public getScatter () : S.TScatter {
        return this.getStats< S.TScatter >( 'scatter.json', 'json' );
    }

    // generate DB stats

    public generateDBStats () : boolean {
        return log.catch( () => {
            log.debug( 'Generating DB stats ...' );
            const stats = { files: 0, size: 0 };

            const scan = ( path: string ) : void => {
                readdirSync( path, { recursive: true } ).forEach( p => {
                    if ( p === '.' || p === '..' || typeof p !== 'string' ) return;
                    const fullPath = join( path, p );
                    const stat = Stats.storage.stat( fullPath );
                    if ( stat ) stat.isDirectory() ? scan( fullPath ) : (
                        stats.files++, stats.size += stat.size
                    );
                } );
            };

            scan( Stats.storage.getRoot() );
            return this.saveStats< S.TDBStats >( 'db.json', 'json',
                this.prepStats< S.TDBStats >(
                    Parser.container< Partial< S.TDBStats > >( {
                        files: { value: stats.files, type: 'number' },
                        size: { value: stats.size, type: 'number' }
                    } )
                )
            );
        }, `Failed to generate DB stats` ) ?? false;
    }

    // Instantiate

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
