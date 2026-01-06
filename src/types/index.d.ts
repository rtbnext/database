import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IFilter } from '@/interfaces/filter';
import { IListIndex, IProfileIndex } from '@/interfaces/index';
import { IQueue } from '@/interfaces/queue';
import { IMover } from '@/interfaces/snapshot';
import { IStorage } from '@/interfaces/storage';

export interface TIndex {
    profile: IProfileIndex;
    list: IListIndex;
}

export interface TModel {
    filter: IFilter;
    mover: IMover;
}

export interface TServices {
    readonly config: IConfig;
    readonly fetch: IFetch;
    readonly profileQueue: IQueue;
    readonly listQueue: IQueue;
    readonly storage: IStorage;
}
