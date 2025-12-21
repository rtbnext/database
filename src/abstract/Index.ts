import { Storage } from '@/core/Storage';
import { Utils } from '@/utils/Utils';
import deepmerge from 'deepmerge';

export abstract class Index<
    I extends { readonly uri: string, text: string },
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
        const raw = this.storage.readJSON< Record< string, I > > ( this.path ) ?? {};
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

    public update ( uriLike: string, data: Partial< I >, allowUpdate: boolean = true ) : I | false {
        const uri = Utils.sanitize( uriLike );
        if ( ! allowUpdate && this.index.has( uri ) ) return false;

        const item = deepmerge< I >( this.index.get( uri ) ?? {}, data, {
            arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'unique' )
        } );

        this.index.set( uri, item );
        this.saveIndex();

        return item;
    }

    public add ( uriLike: string, data: I ) : I | false {
        return this.update( uriLike, data, false );
    }

    public delete ( uriLike: string ) : void {
        this.index.delete( Utils.sanitize( uriLike ) );
        this.saveIndex();
    }

    public search ( query: string, looseMatch: boolean = false ) : T {
        const tokens = Utils.buildSearchText( query ).split( ' ' ).filter( Boolean );
        return new Map( [ ...this.index ].filter( ( [ _, { text } ] ) =>
            Utils.tokenSearch( text, tokens, looseMatch )
        ) ) as T;
    }

}
