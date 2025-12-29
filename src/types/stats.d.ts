import { TMetaData } from '@/types/generic';
import { TListStats } from '@/types/list';
import { Gender, Industry, MaritalStatus } from '@/utils/Const';

export type TStatsHistory = TStatsHistoryItem[];

export type TStatsHistoryItem = [ string, number, number, number, number, number, number ];

export type TDailyStats = TStatsHistory;

export type TRealtimeStats = TListStats;

export interface TStats< T extends string > {
    index: TMetaData & { [ K in T ]: TListStats & { first: {
        readonly uri: string;
        name: string;
        rank: number;
        networth: number;
    } } };
    history: { [ K in T ]: TStatsHistory };
}

export type TIndustryStats = TStats< Industry >;

export type TCitizenshipStats = TStats< string >;

export type TStatsList< T extends string > = { [ K in T ]?: number };

export type TAgePyramid = { [ K in Gender ]?: TStatsList< `${number}` > };

export interface TGlobalStats {
    agePyramid: TAgePyramid;
    maritalStatus: TStatsList< MaritalStatus >;
    children: {
        full: StatsList< `${number}` >;
        short: StatsList< 'none' | 'one' | 'two' | 'three' | 'four' | '5-to-10' | 'over-10' >;
    };
    selfMade: TStatsList< `${number}` >;
    philanthropyScore: TStatsList< `${number}`  >;
}

export interface TScatterItem {
    readonly uri: string;
    name: string;
    gender: Gender;
    age: number;
    networth: number;
}

export type TScatter = TScatterItem[];
