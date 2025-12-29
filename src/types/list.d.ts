import { TChange, TMetaData } from '@/types/generic';
import { Gender, Industry } from '@/utils/Const';

export type TListIndex< T extends string = string > = Map< T, TListIndexItem< T > >;

export interface TListIndexItem< T extends string = string > {
    readonly uri: T;
    name: string;
    shortName: string;
    desc?: string;
    date: string;
    text: string;
    count: number;
    columns: string[];
    filters: string[];
}

export type TList = Record< string, TListSnapshot >;

export type TListStats = TChange & {
    date: string;
    count: number;
    total: number;
    woman: number;
    quota: number;
};

export interface TListSnapshot {
    '@metadata': TMetaData;
    date: string;
    stats: TListStats;
    items: TListItem[];
}

export interface TListItem {
    uri: string;
    name: string;
    rank: number;
    networth: number;
    gender?: Gender;
    age?: number;
    citizenship?: string;
}

export interface TRTBSnapshot extends TListSnapshot {
    items: TRTBItem;
}

export interface TRTBItem extends TListItem {
    today?: {
        value: number;
        pct: number;
    };
    ytd?: {
        value: number;
        pct: number;
    };
    industry: Industry;
    source: string[];
}

export interface TListCollection {
    list: Record< string, TList >;
    index: TListIndex;
};
