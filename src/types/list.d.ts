export type TListIndex< T extends string = string > = Map< T, TListIndexItem< T > >;

export interface TListIndexItem< T extends string = string > {
    uri: T;
    name: string;
    short: string;
    description?: string;
    latestDate: string;
    count: number;
    columns: string[];
    filters: string[];
}
