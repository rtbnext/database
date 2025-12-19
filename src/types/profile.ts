import { TEducation, TImage, TLocation, TMetaData, TRelation } from '@/types/generic';
import { Gender, Industry, MaritalStatus } from '@/utils/Const';

export type TProfileIndex< T extends string = string > = Map< T, TProfileIndexItem< T > >;

export interface TProfileIndexItem< T extends string = string > {
    readonly uri: T;
    name: string;
    aliases: string[];
    text: string;
};

export interface TProfileData< T extends string = string > {
    uri: T;
    info: {
        deceased: boolean;
        family: boolean;
        dropOff: boolean;
        embargo?: boolean;
        name: string;
        shortName: string;
        lastName: string;
        firstName: string;
        gender: Gender;
        birthDate?: string;
        birthPlace?: TLocation;
        citizenship?: string;
        residence?: TLocation;
        maritalStatus?: MaritalStatus;
        children?: number;
        education?: TEducation[];
        industry: Industry;
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
    related: TRelation[];
    media: TImage[];
};

export type TProfileHistory = TProfileHistoryItem[];

export type TProfileHistoryItem = [ string, number, number, number, number ];

export type TProfile< T extends string = string > = {
    meta: TMetaData;
    profile: TProfileData< T >;
    history: TProfileHistory;
};
