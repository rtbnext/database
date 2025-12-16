import { Storage } from '@/core/Storage';
import { Utils } from '@/utils';

export abstract class Index<
    I extends { uri: string, text: string },
    T extends Map< string, I >
> {

    protected readonly storage: Storage;
    protected readonly path: string;
    protected index: T;

    constructor ( path: string ) {
        this.storage = Storage.getInstance();
        this.path = path;
        this.index = this.loadIndex();
    }

    protected loadIndex () : T {
        const raw = this.storage.readJSON< Record< string, I > > ( this.path ) || {};
        return new Map( Object.entries( raw ) ) as T;
    }

    protected saveIndex () : void {
        const content = Object.fromEntries( Utils.sort< T >( this.index ) );
        this.storage.writeJSON< Record< string, I > >( this.path, content );
    }

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

    public update () : I | false {
        return false;
    }

    public add () : I | false {
        return false;
    }

    public delete ( uriLike: string ) : void {
        this.index.delete( Utils.sanitize( uriLike ) );
        this.saveIndex();
    }

    public search ( query: string, exactMatch: boolean = false ) : T {
        const sanitized = Utils.sanitize( query, ' ' );
        return new Map( [ ...this.index ].filter( ( [ _, { text } ] ) =>
            Utils.search( text, sanitized, exactMatch )
        ) ) as T;
    }

}
