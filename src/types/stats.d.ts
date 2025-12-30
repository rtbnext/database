import { TMetaData } from '@/types/generic';
import { TListStats } from '@/types/list';
import { Gender } from '@/utils/Const';

export type TRealtimeStats = TListStats;

export type TStatsItem = TListStats & {
    first: {
        readonly uri: string;
        name: string;
        rank: number;
        networth: number;
    };
};

export type TStatsHistory = TStatsHistoryItem[];

export type TStatsHistoryItem = [ string, number, number, number, number, number, number ];

export interface TStats< T extends string > {
    index: { '@metadata': TMetaData; } & { [ K in T ]: TStatsItem };
    history: { [ K in T ]: TStatsHistory };
}

export interface TStatsCollection {
    industry: TStats< string >;
    citizenship: TStats< string >;
}

export type TStatsList< T extends string > = { [ K in T ]?: number };

export type TAgePyramid = Record< Gender, {
    count: number;
    decades: TStatsList< string >;
    max: number;
    min: number;
    mean: number;
} >;

export interface TProfileStats {
    '@metadata': TMetaData;
    gender: TStatsList< Gender >;
    maritalStatus: TStatsList< MaritalStatus >;
    agePyramid: TAgePyramid;
    children: {
        full: TStatsList< string >;
        short: TStatsList< 'none' | 'one' | 'two' | 'three' | 'four' | '5-to-10' | 'over-10' >;
    };
    selfMade: TStatsList< string >;
    philanthropyScore: TStatsList< string >;
}

export interface TWealthStats {
    '@metadata': TMetaData;
    percentiles: TStatsList< '10th' | '25th' | '50th' | '75th' | '90th' | '95th' | '99th' >;
    quartiles: [ number, number, number ];
    total: number;
    max: number;
    min: number;
    mean: number;
    median: number;
    stdDev: number;
    decades: TStatsList< string >;
    gender: TStatsList< Gender >;
    spread: TStatsList< '1' | '2' | '5' | '10' | '20' | '50' | '100' | '200' | '500' >;
}

export interface TScatterItem {
    readonly uri: string;
    name: string;
    gender: Gender;
    age: number;
    networth: number;
}

export interface TScatter {
    '@metadata': TMetaData;
    items: TScatterItem[];
}
