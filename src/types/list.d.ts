import { TMetaData } from '@/types/generic';
import { Industry } from '@/utils/Const';

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

export interface TListSnapshot {
    '@metadata': TMetaData;
    date: string;
    stats: {
        count: number;
        total: number;
        woman?: number;
        quote?: number;
    }
    items: {
        uri: string;
        name: string;
        rank: number;
        networth: number;
        gender?: Gender;
        age?: number;
        citizenship?: string;
    }[];
};

export type TRTBSnapshot = TListSnapshot & {
    items: {
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
    }[];
}

export interface TListCollection {
    list: Record< string, TList >;
    index: TListIndex;
};
