import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { Filter } from '@/model/Filter';
import { ProfileIndex } from '@/model/ProfileIndex';
import { ListIndex } from '@/model/ListIndex';
import { Mover } from '@/model/Mover';
import { Stats } from '@/model/Stats';
import { TIndex, TJobs, TModel, TServices } from '@/types/index';
import { StatsJob } from './job/Stats';

export * as Const from '@/core/Const';
export { log } from '@/core/Logger';
export { List } from '@/model/List';
export { Profile } from '@/model/Profile';

export const index: TIndex = {
    profile: ProfileIndex.getInstance(),
    list: ListIndex.getInstance()
};

export const model: TModel = {
    filter: Filter.getInstance(),
    mover: Mover.getInstance(),
    stats: Stats.getInstance()
};

export const services: TServices = {
    config: Config.getInstance(),
    fetch: Fetch.getInstance(),
    profileQueue: ProfileQueue.getInstance(),
    listQueue: ListQueue.getInstance(),
    storage: Storage.getInstance()
};

export const jobs: TJobs = {
    stats: StatsJob
};
