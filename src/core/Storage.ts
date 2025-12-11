import { StorageConfig } from '@/types/config';
import { Logger } from '@/utils/Logger';
import { ConfigLoader } from './ConfigLoader';

export class Storage {

    private static instance: Storage;
    private readonly logger: Logger;
    private readonly config: StorageConfig;

    private constructor () {
        this.logger = Logger.getInstance();
        this.config = ConfigLoader.getInstance().storage;
    }

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
