import { ConfigLoader } from '@/core/ConfigLoader';
import { Fetch } from '@/core/Fetch';

const Core = {
    config: ConfigLoader.getInstance,
    fetch: Fetch.getInstance
};

export { ConfigLoader, Fetch };
export default Core;
