export interface TFilter {
    readonly uri: string;
    name: string;
}

export interface TFilterCollection {
    industry: Record< string, TFilter[] >;
    citizenship: Record< string, TFilter[] >;
    country: Record< string, TFilter[] >;
    state: Record< string, TFilter[] >;
    gender: Record< string, TFilter[] >;
    age: Record< string, TFilter[] >;
    maritalStatus: Record< string, TFilter[] >;
    special: {
        deceased: TFilter[];
        dropOff: TFilter[];
        family: TFilter[];
        selfMade: TFilter[];
    };
}
