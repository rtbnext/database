import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';
import { Storage } from '@/core/Storage';

const service = {
    config: ConfigLoader.getInstance,
    fetch: Fetch.getInstance,
    storage: Storage.getInstance
} as const;

export { ConfigLoader, Fetch, Storage };
export default service;
