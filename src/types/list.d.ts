import { TMetaData } from '@/types/generic';

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
};

export interface TListCollection {
    list: Record< string, TList >;
    index: TListIndex;
};
