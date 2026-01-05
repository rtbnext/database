import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IIndex } from '@/interfaces/index';
import { TIndex } from '@rtbnext/schema/src/abstract/generic';
import deepmerge from 'deepmerge';

export abstract class Index<
    I extends TIndex, T extends Map< string, I >
> implements IIndex< I, T > {

    protected static readonly storage = Storage.getInstance();
    protected readonly type: 'profile' | 'list';
    protected readonly path: string;
    protected index: T;

    protected constructor ( type: 'profile' | 'list', path: string ) {
        this.type = type;
        this.path = path;
        Index.storage.ensurePath( this.path );
        this.index = this.loadIndex();
    }

    // Load & save index

    protected loadIndex () : T {
        const raw = Index.storage.readJSON< Record< string, I > > ( this.path ) ?? {};
        log.debug( `Index [${this.type}] loaded: ${ Object.keys( raw ).length } items` );
        return new Map( Object.entries( raw ) ) as T;
    }

    protected saveIndex () : void {
        const content = Object.fromEntries( this.index );
        Index.storage.writeJSON< Record< string, I > >( this.path, content );
    }

    // Basic index operations

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

    // Manipulate index (add, update, remove items)

    public update (
        uriLike: string, data: Partial< I >, allowUpdate: boolean = true,
        save: boolean = true
    ) : I | false {
        return log.catch( () => {
            const uri = Utils.sanitize( uriLike );
            if ( ! allowUpdate && this.index.has( uri ) ) return false;

            log.debug( `Updating index [${this.type}] item: ${uri}` );
            const item = deepmerge< I >( this.index.get( uri ) ?? {}, data, {
                arrayMerge: ( t, s ) => Utils.mergeArray( t, s, 'unique' )
            } );

            this.index.set( uri, item );
            if ( save ) this.saveIndex();

            return item;
        }, `Failed to update index [${this.type}] item: ${uriLike}` ) ?? false;
    }

}
