import { Config, ConfigObject } from './Config';
import { Fetch } from './Fetch';
import { Logger } from './Logger';
import { Storage } from './Storage';

export abstract class Maintenance {

    protected readonly config: ConfigObject[ 'api' ];
    protected logger: Logger;
    protected fetch: Fetch;
    protected storage: Storage;

    constructor () {

        this.config = Config.getInstance().getAPIConfig();
        this.logger = Logger.getInstance();
        this.fetch = Fetch.getInstance();
        this.storage = Storage.getInstance();

    }

    public abstract run () : Promise< void >;

}
