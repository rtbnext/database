import { Gender, MaritalStatus } from '@/utils/Const';
import { TMetaData } from './generic';

export interface TFilter {
    readonly uri: string;
    name: string;
}

export interface TFilterList {
    '@metadata': TMetaData;
    items: TFilter[];
    count: number;
}

export interface TFilterCollection {
    industry: Record< string, TFilter[] >;
    citizenship: Record< string, TFilter[] >;
    country: Record< string, TFilter[] >;
    state: Record< string, TFilter[] >;
    gender: Partial< Record< Gender, TFilter[] > >;
    age: Partial< Record< number, TFilter[] > >;
    maritalStatus: Partial< Record< MaritalStatus, TFilter[] > >;
    special: {
        deceased: TFilter[];
        dropOff: TFilter[];
        family: TFilter[];
        selfMade: TFilter[];
    };
}
