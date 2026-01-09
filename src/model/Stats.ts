import { Percentiles, StatsGroup, WealthSpread } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IStats } from '@/interfaces/stats';
import { Parser } from '@/parser/Parser';
import { TStatsGroup } from '@rtbnext/schema/src/abstract/const';
import { TProfileData } from '@rtbnext/schema/src/model/profile';
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
        return log.catch( () =>
            ( Stats.storage[ format === 'csv' ? 'writeCSV' : 'writeJSON' ] as any )
            ( this.resolvePath( path ), data ), `Failed to save stats to ${path}`
        ) ?? false;
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
        const history = Object.fromEntries( Object.keys( index.items ).map(
            k => [ k, this.getGroupedStatsHistory( group, k ) ]
        ) );
        return { index, history };
    }

    // Stats setter

    public setGlobalStats ( data: Partial< S.TGlobalStats > ) : boolean {
        return this.saveStats( 'global.json', 'json', this.prepStats(
            Parser.container< Partial< S.TGlobalStats > >( {
                date: { value: data.date, type: 'date', args: [ 'ymd' ] },
                count: { value: data.count, type: 'number' },
                total: { value: data.total, type: 'money' },
                woman: { value: data.woman, type: 'number' },
                quota: { value: data.quota, type: 'pct' },
                today: { value: Parser.container< S.TGlobalStats[ 'today' ] >( {
                    value: { value: data.today?.value, type: 'money' },
                    pct: { value: data.today?.pct, type: 'pct' }
                } ), type: 'container' },
                ytd: { value: Parser.container< S.TGlobalStats[ 'ytd' ] >( {
                    value: { value: data.ytd?.value, type: 'money' },
                    pct: { value: data.ytd?.pct, type: 'pct' }
                } ), type: 'container' },
                stats: { value: Parser.container< S.TGlobalStats[ 'stats' ] >( {
                    profiles: { value: data.stats?.profiles, type: 'number' },
                    days: { value: data.stats?.days, type: 'number' }
                } ), type: 'container' }
            } )
        ) );
    }

    public setProfileStats ( data: Partial< S.TProfileStats > ) : boolean {
        return this.saveStats( 'profile.json', 'json', this.prepStats( data ) );
    }

    public setWealthStats ( data: Partial< S.TWealthStats > ) : boolean {
        const { percentiles = {}, decades = {}, gender = {}, spread = {} } = data;

        Object.entries( percentiles ).forEach(
            ( [ k, v ] ) => ( percentiles as any )[ k ] = Parser.money( v )
        );

        Object.entries( decades ).forEach(
            ( [ k, v ] ) => ( decades as any )[ k ] = Parser.money( v )
        );

        Object.entries( gender ).forEach(
            ( [ k, v ] ) => ( gender as any )[ k ] = Parser.money( v )
        );

        Object.entries( spread ).forEach(
            ( [ k, v ] ) => ( spread as any )[ k ] = Parser.number( v )
        );

        return this.saveStats( 'wealth.json', 'json', this.prepStats( {
            percentiles, decades, gender, spread,
            ...Parser.container< Partial< S.TWealthStats > >( {
                quartiles: { value: data.quartiles, type: 'list', args: [ 'money' ] },
                total: { value: data.total, type: 'money' },
                max: { value: data.max, type: 'money' },
                min: { value: data.min, type: 'money' },
                mean: { value: data.mean, type: 'money' },
                median: { value: data.median, type: 'money' },
                stdDev: { value: data.stdDev, type: 'money' }
            } )
        } ) );
    }

    public setScatter ( data: Partial< S.TScatter > ) : boolean {
        return this.saveStats( 'scatter.json', 'json', this.prepStats( data ) );
    }

    // Update history (add new line)

    public updateHistory ( data: Partial< S.TGlobalStats > ) : boolean {
        return log.catch(
            () => Stats.storage.datedCSV< S.THistoryItem >( this.resolvePath( 'history.csv' ), [
                data.date!, data.count!, data.total!, data.woman!, data.quota!,
                data.today?.value ?? 0, data.today?.pct ?? 0
            ], true ),
            `Failed to update history`
        ) ?? false;
    }

    // Generate wealth stats

    public generateWealthStats ( scatter: S.TScatterItem[] ) : boolean {
        return log.catch( () => {
            log.debug( 'Generating wealth stats ...' );
            if ( ! scatter || ! scatter.length ) throw new Error( 'No scatter data provided' );
            scatter.sort( ( a, b ) => a.networth - b.networth );

            const count = scatter.length;
            const total = Parser.money( scatter.reduce( ( acc, i ) => acc + i.networth, 0 ) );
            const medianIndex = Math.floor( count / 2 );
            const median = Parser.money( count % 2 === 0 ? (
                scatter[ medianIndex - 1 ].networth + scatter[ medianIndex ].networth
            ) / 2 : scatter[ medianIndex ].networth );
            const mean = Parser.money( total / count );
            const variance = scatter.reduce( ( acc, i ) => {
                const diff = i.networth - mean; return acc + diff * diff;
            }, 0 ) / count;
            const stdDev = Parser.money( Math.sqrt( variance ) );

            const percentiles: S.TWealthStats[ 'percentiles' ] = {};
            Percentiles.forEach( p => {
                const idx = Math.ceil( ( parseInt( p ) / 100 ) * count ) - 1;
                percentiles[ p ] = scatter[ idx ].networth;
            } );

            const quartiles: S.TWealthStats[ 'quartiles' ] = [
                scatter[ Math.floor( count * 0.25 ) ].networth,
                scatter[ Math.floor( count * 0.5 ) ].networth,
                scatter[ Math.floor( count * 0.75 ) ].networth
            ];

            const decades: S.TWealthStats[ 'decades' ] = {};
            const gender: S.TWealthStats[ 'gender' ] = {};
            const spread: S.TWealthStats[ 'spread' ] = {};

            scatter.forEach( item => {
                const { gender: g, age, networth } = item;
                const decade = Math.max( 30, Math.min( 90, Math.floor( age / 10 ) * 10 ) );
                decades[ decade ] = Parser.money( ( decades[ decade ] || 0 ) + networth );
                gender[ g ] = Parser.money( ( gender[ g ] || 0 ) + networth );

                WealthSpread.forEach( n => {
                    if ( networth >= Number( n ) * 1000 ) ( spread as any )[ n ] = (
                        ( spread as any )[ n ] || 0
                    ) + 1;
                } );
            } );

            return this.setWealthStats( {
                total, median, mean, stdDev, percentiles, quartiles, decades, gender, spread,
                max: scatter.at( -1 )!.networth, min: scatter[ 0 ].networth
            } )
        }, `Failed to generate wealth stats` ) ?? false;
    }

    // Generate DB stats

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

    // Aggregate stats data

    public static aggregate ( data: TProfileData, date: string, col: any = {} ) : any {
        return log.catch( () => {
            const { uri, info, realtime, realtime: { rank, networth } = {} } = data;
            const age = Parser.age( info.birthDate ), decade = Parser.ageDecade( info.birthDate );
            const item = { uri, name: info.shortName ?? info.name };

            const set = ( path: string, n: any ) : void => Utils.update( 'set', col, path, n );
            const inc = ( path: string, n?: number ) : void => Utils.update( 'inc', col, path, n );
            const max = ( path: string, n: number ) : void => Utils.update( 'max', col, path, n );
            const min = ( path: string, n: number ) : void => Utils.update( 'min', col, path, n );
            const srt = ( n: number ) => n >= 10 ? 'over-10' : n >= 5 ? '5-to-10' : n === 4
                ? 'four' : n === 3 ? 'three' : n === 2 ? 'two' : n === 1 ? 'one' : 'none';

            if ( info.gender ) inc( `profile.gender.${info.gender}` );
            if ( info.maritalStatus ) inc( `profile.maritalStatus.${info.maritalStatus}` );
            if ( info.selfMade?.rank ) inc( `profile.selfMade.${info.selfMade.rank}` );
            if ( info.philanthropyScore ) inc( `profile.philanthropyScore.${info.philanthropyScore}` );

            if ( info.gender && age && decade ) {
                inc( `profile.agePyramid.${info.gender}.count` );
                inc( `profile.agePyramid.${info.gender}.decades.${decade}` );
                inc( `profile.agePyramid.${info.gender}.total`, age );
                max( `profile.agePyramid.${info.gender}.max`, age );
                min( `profile.agePyramid.${info.gender}.min`, age );

                set( `profile.agePyramid.${info.gender}.mean`, (
                    col.profile.agePyramid[ info.gender ].total /
                    col.profile.agePyramid[ info.gender ].count
                ) );
            }

            if ( info.children ) {
                inc( `profile.children.full.${info.children}` );
                inc( `profile.children.short.${ srt( info.children ) }` );
            } else {
                inc( 'profile.children.short.none' );
            }

            if ( ! networth || ! rank || realtime?.date !== date ) return col;

            if ( info.gender && age && networth ) ( col.scatter ??= [] ).push( {
                ...item, gender: info.gender, age, networth
            } );

            let k: any;
            StatsGroup.forEach( key => {
                if ( k = ( info as any )[ key ] ) {
                    inc( `groups.${key}.${k}.count` );
                    inc( `groups.${key}.${k}.total`, networth );
                    inc( `groups.${key}.${k}.woman`, +( info.gender === 'f' ) );

                    set( `groups.${key}.${k}.quota`, (
                        col.groups[ key ][ k ].woman /
                        col.groups[ key ][ k ].count * 100
                    ) );

                    inc( `groups.${key}.${k}.today.value`, realtime.today?.value ?? 0 );
                    inc( `groups.${key}.${k}.today.pct`, realtime.today?.pct ?? 0 );
                    inc( `groups.${key}.${k}.ytd.value`, realtime.ytd?.value ?? 0 );
                    inc( `groups.${key}.${k}.ytd.pct`, realtime.ytd?.pct ?? 0 );

                    if ( rank < ( col?.groups?.[ key ]?.[ k ]?.first?.rank ?? Infinity ) ) set(
                        `groups.${key}.${k}.first`, { ...item, rank, networth }
                    );
                }
            } );

            return col;
        }, `Failed to aggregate stats data`) ?? col;
    }

}
