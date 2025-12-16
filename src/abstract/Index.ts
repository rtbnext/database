import { Storage } from '@/core/Storage';

export abstract class Index< T > {

    protected readonly storage: Storage;
    protected index: T;

    constructor () {
        this.storage = Storage.getInstance();
        this.index = this.loadIndex();
    }

    protected abstract loadIndex () : T;

}
