import { AssetType, Relationship } from '@/utils/Const';

export type TArgs = Record< string, string | boolean >;

export interface TMetaData {
    schemaVersion: 2,
    lastModified: string;
};

export interface TLocation {
    country: string;
    state?: string;
    city?: string;
};

export interface TEducation {
    school: string;
    degree?: string;
};

export interface TRelation {
    type: Relationship;
    name: string;
    relation?: string;
    uri?: string;
};

export interface TImage {
    url: string;
    credits: string;
    file: string;
    thumb?: string;
    caption?: string;
    desc?: string;
    date?: string;
};

export interface TMap {
    lat: number;
    lon: number;
    country: string;
    address?: string;
    area?: number;
    year?: number;
    value?: number;
    polygon?: number[][];
}

export interface TRanking {
    list: string;
    date: string;
    rank: number;
    networth?: number;
    prev?: string;
    next?: string;
}

export interface TAsset {
    type: AssetType;
    label: string;
    value?: number;
    info?: {
        exchange: string;
        ticker: string;
        shares?: number;
        price: number;
        currency: string;
        exRate: number;
    };
}
