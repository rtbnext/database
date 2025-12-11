import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';

const service = {
    config: ConfigLoader.getInstance,
    fetch: Fetch.getInstance
} as const;

export { ConfigLoader, Fetch };
export default service;
