import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { MoveJob } from '@/job/Move';
import { QueueJob } from '@/job/Queue';
import { StatsJob } from '@/job/Stats';
import { WikiJob } from '@/job/Wiki';
import { Filter } from '@/model/Filter';
import { ProfileIndex } from '@/model/ProfileIndex';
import { ListIndex } from '@/model/ListIndex';
import { Mover } from '@/model/Mover';
import { Stats } from '@/model/Stats';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { ProfileParser } from '@/parser/ProfileParser';
import { TIndex, TModel, TParser, TServices, TUtils } from '@/types/index';
import { TJobs } from '@/types/job';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { Ranking } from '@/utils/Ranking';

// Direct exports

export * as Const from '@/core/Const';
export { log } from '@/core/Logger';
export { Wiki } from '@/core/Wiki';
export { List } from '@/model/List';
export { Profile } from '@/model/Profile';

// Grouped exports

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

export const parser: TParser = {
    parser: Parser,
    profile: ProfileParser,
    list: ListParser
};

export const utils: TUtils = {
    profileMerger: ProfileMerger,
    ranking: Ranking
};

export const jobs: TJobs = {
    move: MoveJob,
    queue: QueueJob,
    stats: StatsJob,
    wiki: WikiJob
};
