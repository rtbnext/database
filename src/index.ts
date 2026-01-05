import { Config } from '@/core/Config';
import { Fetch } from '@/core/Fetch';
import { ListQueue, ProfileQueue } from '@/core/Queue';
import { Storage } from '@/core/Storage';
import { ProfileIndex } from '@/model/ProfileIndex';
import { ListIndex } from '@/model/ListIndex';
import { TIndex, TServices } from '@/types/index';

export * as Const from '@/core/Const';
export { log } from '@/core/Logger';

export const services: TServices = {
    config: Config.getInstance(),
    fetch: Fetch.getInstance(),
    profileQueue: ProfileQueue.getInstance(),
    listQueue: ListQueue.getInstance(),
    storage: Storage.getInstance()
};

export const index: TIndex = {
    profile: ProfileIndex.getInstance(),
    list: ListIndex.getInstance()
};
