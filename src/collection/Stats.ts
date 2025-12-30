import { Storage } from '@/core/Storage';
import { TProfileStats, TRealtimeStats, TScatter, TStats, TStatsHistoryItem, TStatsItem } from '@/types/stats';
import { StatsGroup } from '@/utils/Const';
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
