import { StatsGroup } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IStats } from '@/interfaces/stats';
import { Parser } from '@/parser/Parser';
import { TStatsGroup } from '@rtbnext/schema/src/abstract/const';
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
        return { ...Utils.metaData(), ...data } as T;
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

    public getProfileStats () : S.TProfileStats {
        return this.getStats< S.TProfileStats >( 'profile.json', 'json' );
    }

    public getWealthStats () : S.TWealthStats {
        return this.getStats< S.TWealthStats >( 'wealth.json', 'json' );
    }

    public getScatter () : S.TScatter {
        return this.getStats< S.TScatter >( 'scatter.json', 'json' );
    }

    public getHistory () : S.THistory {
        return this.getStats< S.THistory >( 'history.csv', 'csv' );
    }

    public getDBStats () : S.TDBStats {
        return this.getStats< S.TDBStats >( 'db.json', 'json' );
    }

    // Get grouped stats

    public getGroupedStatsIndex ( group: TStatsGroup ) : S.TStatsGroup< string >[ 'index' ] {
        return this.getStats< S.TStatsGroup< string >[ 'index' ] >( `${group}/index.json`, 'json' );
    }

    public getGroupedStatsHistory ( group: TStatsGroup, key: string ) : S.THistory {
        return this.getStats< S.THistory >( `${group}/${key}.csv`, 'csv' );
    }

    public getGroupedStats ( group: TStatsGroup ) : S.TStatsGroup< string > {
        const index = this.getGroupedStatsIndex( group );
        const history = {};

        for ( const key of Object.keys( index.items ) ) {
            ( history as any )[ key ] = this.getGroupedStatsHistory( group, key );
        }

        return { index, history };
    }

    // Stats setter

    public setGlobalStats ( data: Partial< S.TGlobalStats > ) : boolean {
        return this.saveStats( 'global.json', 'json', this.prepStats( data ) );
    }

    public setProfileStats ( data: Partial< S.TProfileStats > ) : boolean {
        return this.saveStats( 'profile.json', 'json', this.prepStats( data ) );
    }

    public setWealthStats ( data: Partial< S.TWealthStats > ) : boolean {
        return this.saveStats( 'wealth.json', 'json', this.prepStats( data ) );
    }

    public setScatter ( data: Partial< S.TScatter > ) : boolean {
        return this.saveStats( 'scatter.json', 'json', this.prepStats( data ) );
    }

    // Update history (add new line)

    public updateHistory ( data: Partial< S.TGlobalStats > ) : boolean {
        return Stats.storage.datedCSV< S.THistoryItem >( this.resolvePath( 'history.csv' ), [
            data.date!, data.count!, data.total!, data.woman!, data.quota!,
            data.today?.value ?? 0, data.today?.pct ?? 0
        ], true );
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
            return this.saveStats( 'db.json', 'json', this.prepStats(
                Parser.container< Partial< S.TDBStats > >( {
                    files: { value: stats.files, type: 'number' },
                    size: { value: stats.size, type: 'number' }
                } )
            ) );
        }, `Failed to generate DB stats` ) ?? false;
    }

    // Set grouped stats

    public setGroupedStats< T extends string = string > (
        group: TStatsGroup, raw: Record< T, S.TStatsGroupItem >
    ) : boolean {
        return log.catch( () => {
            const items = Object.fromEntries(
                Object.entries< S.TStatsGroupItem >( raw ).map( ( [ key, item ] ) => {
                    item.total = Parser.money( item.total );
                    item.quota = Parser.pct( item.quota );
                    item.today = {
                        value: Parser.money( item.today?.value ),
                        pct: Parser.pct( item.today?.pct )
                    };
                    item.ytd = {
                        value: Parser.money( item.ytd?.value ),
                        pct: Parser.pct( item.ytd?.pct )
                    };

                    Stats.storage.datedCSV< S.THistoryItem >(
                        this.resolvePath( `${group}/${key}.csv` ),
                        [ item.date, item.count, item.total, item.woman, item.quota,
                          item.today?.value ?? 0, item.today?.pct ?? 0 ],
                        true
                    );

                    return [ key, item ];
                } )
            ) as Record< T, S.TStatsGroupItem >;

            this.saveStats< S.TStatsGroup< T >[ 'index' ] >(
                `${group}/index.json`, 'json', this.prepStats( { items } as any )
            );
        }, `Failed to set grouped stats for group ${group}` ) ?? false;
    }

    // Instantiate

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
