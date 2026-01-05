import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IListIndex, IProfileIndex } from '@/interfaces/index';
import { IQueue } from '@/interfaces/queue';
import { IStorage } from '@/interfaces/storage';

export interface TModel {
    profileIndex: IProfileIndex;
    listIndex: IListIndex;
}

export interface TServices {
    readonly config: IConfig;
    readonly fetch: IFetch;
    readonly profileQueue: IQueue;
    readonly listQueue: IQueue;
    readonly storage: IStorage;
}
