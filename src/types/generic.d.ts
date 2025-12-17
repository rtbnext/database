export interface TMetaData {
    schemaVersion: 2,
    lastModified: string;
};

export type TLocation = {
    country: string;
    state?: string;
    city?: string;
};

export type TImage = {
    url: string;
    credits: string;
    file: string;
    thumb?: string;
    caption?: string;
    desc?: string;
    date?: string;
};
