import { Storage } from '@/core/Storage';
import { Utils } from '@/utils';

export abstract class Index< T extends Map< string, any >, I > {

    protected readonly storage: Storage;
    protected index: T;

    constructor () {
        this.storage = Storage.getInstance();
        this.index = this.loadIndex();
    }

    protected abstract loadIndex () : T;

    protected abstract saveIndex () : void;

    public getIndex () : T {
        return this.index;
    }

    public size () : number {
        return this.index.size;
    }

    public has ( uriLike: string ) : boolean {
        return this.index.has( Utils.sanitize( uriLike ) );
    }

    public get ( uriLike: string ) : I | undefined {
        return this.index.get( Utils.sanitize( uriLike ) );
    }

}
