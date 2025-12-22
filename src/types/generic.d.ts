import { AssetType, Flag, Relationship } from '@/utils/Const';

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

export interface TRealtime {
    date: string;
    rank?: number;
    networth: number;
    today?: {
        value: number;
        pct: number;
    };
    ytd?: {
        value: number;
        pct: number;
    };
}

export interface TAnnual {
    year: number,
    rank: TAnnualRecord;
    networth: TAnnualRecord;
}

export interface TAnnualRecord {
    first: number;
    last: number;
    diff: number;
    flag: Flag;
    average: number;
    max: number;
    min: number;
    range: number;
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

export interface TWikidata {
    qid: string;
    article?: string;
    image?: string;
    score: number;
}

export interface TWiki {
    uri: string;
    pageId: number;
    refId: number;
    name: string;
    lastModified: string;
    summary: string[];
    sortKey?: string;
    wikidata?: string;
    desc?: string;
    image?: TImage;
}
