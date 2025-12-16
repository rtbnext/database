export type TListIndex< T extends string = string > = Map< T, TListIndexItem< T > >;

export interface TListIndexItem< T extends string = string > {
    readonly uri: T;
    name: string;
    short: string;
    desc: string;
    text: string;
    date: string;
    count: number;
    columns: string[];
    filters: string[];
}
