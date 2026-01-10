import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IFilter } from '@/interfaces/filter';
import { IListIndex, IProfileIndex } from '@/interfaces/index';
import { IQueue } from '@/interfaces/queue';
import { IMover } from '@/interfaces/mover';
import { IStorage } from '@/interfaces/storage';
import { IStats } from '@/interfaces/stats';
import { IJob } from '@/interfaces/job';

export interface TIndex {
    readonly profile: IProfileIndex;
    readonly list: IListIndex;
}

export interface TModel {
    readonly filter: IFilter;
    readonly mover: IMover;
    readonly stats: IStats;
}

export interface TServices {
    readonly config: IConfig;
    readonly fetch: IFetch;
    readonly profileQueue: IQueue;
    readonly listQueue: IQueue;
    readonly storage: IStorage;
}

export interface TJobs {
    readonly stats: IJob;
}
