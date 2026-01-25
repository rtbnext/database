import { IConfig } from '@/interfaces/config';
import { IFetch } from '@/interfaces/fetch';
import { IFilter } from '@/interfaces/filter';
import { IListIndex, IProfileIndex } from '@/interfaces/index';
import { IQueue } from '@/interfaces/queue';
import { IMover } from '@/interfaces/mover';
import { IStorage } from '@/interfaces/storage';
import { IStats } from '@/interfaces/stats';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import { ProfileManager } from '@/utils/ProfileManager';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { Ranking } from '@/utils/Ranking';

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

export interface TParser {
    readonly parser: typeof Parser;
    readonly profile: typeof ProfileParser;
    readonly list: typeof ListParser;
}

export interface TUtils {
    readonly profileManager: typeof ProfileManager;
    readonly profileMerger: typeof ProfileMerger;
    readonly ranking: typeof Ranking;
}
