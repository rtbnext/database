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
    groups: TStatsList< string >;
    max: number;
    min: number;
    avg: number;
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
