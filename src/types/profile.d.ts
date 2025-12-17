import { TMetaData } from '@/types/generic';

export type TProfileIndex< T extends string = string > = Map< T, TProfileIndexItem< T > >;

export interface TProfileIndexItem< T extends string = string > {
    readonly uri: T;
    name: string;
    aliases: string[];
    text: string;
};

export interface TProfileData< T extends string = string > {
    uri: T;
};

export type TProfileHistory = TProfileHistoryItem[];

export type TProfileHistoryItem = [ string, number, number, number, number ];

export type TProfile< T extends string = string > = {
    meta: TMetaData;
    profile: TProfileData< T >;
    history: TProfileHistory;
};
