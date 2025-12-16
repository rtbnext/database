import { Storage } from '@/core/Storage';
import { Utils } from '@/utils';

export abstract class Index< T extends Map< string, any >, I > {

    protected readonly storage: Storage;
    protected readonly path: string;
    protected index: T;

    constructor ( path: string ) {
        this.storage = Storage.getInstance();
        this.path = path;
        this.index = this.loadIndex();
    }

    private loadIndex () : T {
        const raw = this.storage.readJSON< Record< string, I > > ( this.path ) || {};
        return new Map( Object.entries( raw ) ) as T;
    }

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
