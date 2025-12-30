import { Storage } from '@/core/Storage';
import { TProfileStats, TRealtimeStats, TScatter, TScatterItem, TStats, TStatsHistoryItem, TStatsItem, TWealthStats } from '@/types/stats';
import { Percentiles, StatsGroup } from '@/utils/Const';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class Stats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {
        StatsGroup.forEach( group => Stats.storage.ensurePath( `stats/${group}`, true ) );
    }

    public getRealtime () : TRealtimeStats {
        return Stats.storage.readJSON< TRealtimeStats >( 'stats/realtime.json' ) || {} as TRealtimeStats;
    }

    public setRealtime ( data: TRealtimeStats ) : void {
        Stats.storage.writeJSON< TRealtimeStats >( 'stats/realtime.json', data );
    }

    public updateHistory ( data: TRealtimeStats ) : void {
        Stats.storage.datedCSV< TStatsHistoryItem >( 'stats/history.csv', [
            data.date, data.count, data.total, data.woman, data.quota,
            data.today?.value ?? 0, data.today?.pct ?? 0
        ], true );
    }

    public setGroupStats< T extends string = string > ( group: StatsGroup, raw: Record< T, TStatsItem > ) : void {
        const data = Object.fromEntries( Object.entries< TStatsItem >( raw ).map( ( [ k, i ] ) => {
            i.total = Parser.money( i.total );
            i.quota = Parser.pct( i.quota );
            i.today = { value: Parser.money( i.today?.value ), pct: Parser.pct( i.today?.pct ) };
            i.ytd = { value: Parser.money( i.ytd?.value ), pct: Parser.pct( i.ytd?.pct ) };

            Stats.storage.datedCSV< TStatsHistoryItem >( `stats/${group}/${k}.csv`, [
                i.date, i.count, i.total, i.woman, i.quota, i.today?.value ?? 0, i.today?.pct ?? 0
            ], true );

            return [ k, i ];
        } ) ) as Record< T, TStatsItem >;

        Stats.storage.writeJSON< TStats< T >[ 'index' ] >( `stats/${group}/index.json`, {
            ...Utils.metaData(), ...data
        } );
    }

    public getProfileStats () : TProfileStats {
        return Stats.storage.readJSON< TProfileStats >( 'stats/profile.json' ) || {} as TProfileStats;
    }

    public setProfileStats ( data: TProfileStats ) : void {
        Stats.storage.writeJSON< TProfileStats >( 'stats/profile.json', data );
    }

    public getWealthStats () : TWealthStats {
        return Stats.storage.readJSON< TWealthStats >( 'stats/wealth.json' ) || {} as TWealthStats;
    }

    public setWealthStats ( data: TWealthStats ) : void {
        Stats.storage.writeJSON< TWealthStats >( 'stats/wealth.json', data );
    }

    public generateWealthStats ( scatter: TScatterItem[] ) : void {
        if ( ! scatter || ! scatter.length ) return;
        scatter.sort( ( a, b ) => a.networth - b.networth );

        const count = scatter.length;
        const total = Parser.money( scatter.reduce( ( acc, i ) => acc + i.networth, 0 ) );
        const medianIndex = Math.floor( count / 2 );
        const median = Parser.money( count % 2 === 0 ? (
            scatter[ medianIndex - 1 ].networth + scatter[ medianIndex ].networth
        ) / 2 : scatter[ medianIndex ].networth );
        const mean = Parser.money( total / count );
        const variance = Parser.money( scatter.reduce( ( acc, i ) => {
            const diff = i.networth - mean; return acc + diff * diff;
        }, 0 ) / count );
        const stdDev = Parser.money( Math.sqrt( variance ) );

        const percentiles: TWealthStats[ 'percentiles' ] = {};
        Percentiles.forEach( p => {
            const idx = Math.ceil( ( parseInt( p ) / 100 ) * count ) - 1;
            percentiles[ p ] = scatter[ idx ].networth;
        } );

        const quartiles: TWealthStats[ 'quartiles' ] = [
            scatter[ Math.floor( count * 0.25 ) ].networth,
            scatter[ Math.floor( count * 0.5 ) ].networth,
            scatter[ Math.floor( count * 0.75 ) ].networth
        ];

        const decades: TWealthStats[ 'decades' ] = {};
        const gender: TWealthStats[ 'gender' ] = {};
        const spread: TWealthStats[ 'spread' ] = {};

        scatter.forEach( item => {
            const decade = Math.max( 30, Math.min( 90, Math.floor( item.age / 10 ) * 10 ) );
            decades[ decade ] = Parser.money( ( decades[ decade ] || 0 ) + item.networth );
            gender[ item.gender ] = Parser.money( ( gender[ item.gender ] || 0 ) + item.networth );

            [ 1, 2, 5, 10, 20, 50, 100, 200, 500 ].forEach( n => {
                if ( item.networth >= n * 1000 ) ( spread as any )[ n ] = (
                    ( spread as any )[ n ] || 0
                ) + 1;
            } );
        } );

        this.setWealthStats( {
            ...Utils.metaData(), max: scatter.at( -1 )!.networth, min: scatter[ 0 ].networth,
            total, median, mean, stdDev, percentiles, quartiles, decades, gender, spread
        } );
    }

    public getScatter () : TScatter {
        return Stats.storage.readJSON< TScatter >( 'stats/scatter.json' ) || {} as TScatter;
    }

    public setScatter ( data: TScatter ) : void {
        Stats.storage.writeJSON< TScatter >( 'stats/scatter.json', data );
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
