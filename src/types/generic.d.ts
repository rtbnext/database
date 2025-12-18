import { Relationship } from '@/utils/Const';

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
