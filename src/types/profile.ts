import * as Generic from '@/types/generic';
import * as Const from '@/utils/Const';

export type TProfileIndex< T extends string = string > = Map< T, TProfileIndexItem< T > >;

export interface TProfileIndexItem< T extends string = string > {
    readonly uri: T;
    name: string;
    shortName: string;
    desc?: string;
    image?: string;
    aliases: string[];
    text: string;
};

export interface TProfileData< T extends string = string > {
    uri: T;
    id: string;
    info: {
        deceased: boolean;
        family: boolean;
        dropOff: boolean;
        embargo?: boolean;
        name: string;
        shortName: string;
        lastName: string;
        firstName: string;
        gender: Const.Gender;
        birthDate?: string;
        birthPlace?: Generic.TLocation;
        citizenship?: string;
        residence?: Generic.TLocation;
        maritalStatus?: Const.MaritalStatus;
        children?: number;
        education?: Generic.TEducation[];
        industry: Const.Industry;
        source: string[];
        selfMade: {
            type: string;
            is: boolean;
            rank?: number;
        };
        philanthropyScore?: number;
        organization?: {
            name: string;
            title?: string;
        };
    };
    bio: {
        cv: string[];
        facts: string[];
        quotes: string[];
    };
    related: Generic.TRelation[];
    media: Generic.TImage[];
    map: Generic.TMap[];
    realtime?: Generic.TRealtime;
    ranking: Generic.TRanking[];
    annual: Generic.TAnnual[];
    assets: Generic.TAsset[];
    wiki?: Generic.TWiki;
};

export type TProfileHistory = TProfileHistoryItem[];

export type TProfileHistoryItem = [ string, number, number, number, number ];

export type TProfile< T extends string = string > = {
    meta: Generic.TMetaData;
    profile: TProfileData< T >;
    history: TProfileHistory;
};
