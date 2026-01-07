import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IFilter } from '@/interfaces/filter';
import { IListIndex, IProfileIndex } from '@/interfaces/index';
import { IQueue } from '@/interfaces/queue';
import { IMover } from '@/interfaces/mover';
import { IStorage } from '@/interfaces/storage';
import { IStats } from '@/interfaces/stats';

export interface TIndex {
    profile: IProfileIndex;
    list: IListIndex;
}

export interface TModel {
    filter: IFilter;
    mover: IMover;
    stats: IStats;
}

export interface TServices {
    readonly config: IConfig;
    readonly fetch: IFetch;
    readonly profileQueue: IQueue;
    readonly listQueue: IQueue;
    readonly storage: IStorage;
}
