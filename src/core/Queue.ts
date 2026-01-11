import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { IQueue } from '@/interfaces/queue';
import { TQueueConfig } from '@/types/config';
import { TQueue, TQueueItem, TQueueOptions, TQueueStorage, TQueueType } from '@/types/queue';
import { join } from 'node:path';
import { sha256 } from 'js-sha256';

abstract class Queue implements IQueue {

    protected static readonly storage = Storage.getInstance();

    protected readonly config: TQueueConfig;
    protected readonly type: TQueueType;
    protected readonly path: string;
    protected queue: TQueue;

    protected constructor ( type: TQueueType ) {
        const { root, queue } = Config.getInstance();
        this.config = queue;
        this.type = type;
        this.path = join( root, `queue/${this.type}.json` );
        Queue.storage.ensurePath( this.path );
        this.queue = this.loadQueue();
    }

    protected loadQueue () : TQueue {
        return new Map( ( Queue.storage.readJSON< TQueueStorage >( this.path ) || [] ).map(
            ( i: TQueueItem ) => [ i.key, i ]
        ) );
    }

    protected saveQueue () : void {
        const { defaultPrio = 0 } = this.config;
        Queue.storage.writeJSON< TQueueStorage >( this.path,
            Array.from( this.queue.values() ).sort( ( a: TQueueItem, b: TQueueItem ) =>
                ( b.prio ?? defaultPrio ) - ( a.prio ?? defaultPrio ) || 
                ( new Date( a.ts ).getTime() - new Date( b.ts ).getTime() )
            )
        );
    }

    protected key ( uri: string, args?: any ) : string {
        return sha256( uri + JSON.stringify( args ) );
    }

    // Basic queue operations

    public getQueue () : TQueueItem[] {
        return Array.from( this.queue.values() );
    }

    public size () : number {
        return this.queue.size;
    }

    public getByKey ( key: string ) : TQueueItem | undefined {
        return this.queue.get( key );
    }

    public hasKey ( key: string ) : boolean {
        return this.queue.has( key );
    }

    public getByUri ( uriLike: string ) : TQueueItem[] {
        const uri = Utils.sanitize( uriLike );
        return [ ...this.queue.values() ].filter( i => i.uri === uri );
    }

    public hasUri ( uriLike: string ) : boolean {
        return this.getByUri( uriLike ).length !== 0;
    }

    public clear () : void {
        log.debug( `Clear queue [${this.type}]` );
        this.queue.clear();
        this.saveQueue();
    }

    // Add queue items

    public add ( opt: TQueueOptions, save: boolean = true ) : boolean {
        const { uriLike, args, prio } = opt;
        return log.catch( () => {
            if ( this.queue.size > this.config.maxSize ) throw new Error(
                `Queue size limit reached for type: ${this.type}`
            );

            const uri = Utils.sanitize( uriLike );
            const key = this.key( uri, args );
            const item = this.queue.get( key );
            const ts = item?.ts || Utils.date( 'iso' );
            const data: TQueueItem = { key, uri, ts, args, prio };

            if ( JSON.stringify( item ) === JSON.stringify( data ) ) return false;

            log.debug( `Add to queue [${this.type}]: ${uri}`, data );
            this.queue.set( key, data );
            if ( save ) this.saveQueue();

            return true;
        }, `Failed to add item to queue [${this.type}]: ${uriLike}` ) ?? false;
    }

    public addMany ( items: TQueueOptions[] ) : number {
        const added = items.reduce( ( acc, item ) => acc + +this.add( item, false ), 0 );
        this.saveQueue();
        return added;
    }

    // Remove queue items

    public removeByKey ( key: string ) : boolean {
        return this.queue.delete( key ) && (
            log.debug( `Remove from queue [${this.type}] by key: ${key}`),
            this.saveQueue(), true
        );
    }

    public remove ( ...uriLike: string[] ) : number {
        const keys = [ ...new Set( uriLike.map(
            uri => this.getByUri( uri ).map( i => i.key )
        ).flat() ) ];

        if ( keys && keys.length ) {
            keys.forEach( this.queue.delete.bind( this.queue ) );
            log.debug( `Remove from queue [${this.type}] by URI(s): ${uriLike}`, keys );
            this.saveQueue();
        }

        return keys.length;
    }

    // Get items from queue (processing)

    public next ( n: number = 1 ) : TQueueItem[] {
        const items: TQueueItem[] = [];

        for ( const [ k, item ] of this.queue ) if ( items.length < n ) {
            items.push( item ); this.queue.delete( k );
        } else break;

        this.saveQueue();
        log.debug( `Process ${items.length} item(s) from queue [${this.type}]`, items );
        return items;
    }

    public nextUri ( n: number = 1 ) : string[] {
        return this.next( n ).filter( Boolean ).map( i => i.uri );
    }

}

export class ProfileQueue extends Queue implements IQueue {

    private static instance: ProfileQueue;

    private constructor () {
        super( 'profile' );
    }

    public static getInstance () : ProfileQueue {
        return this.instance ||= new ProfileQueue();
    }

}

export class ListQueue extends Queue implements IQueue {

    private static instance: ListQueue;

    private constructor () {
        super( 'list' );
    }

    public static getInstance () : ListQueue {
        return this.instance ||= new ListQueue();
    }

}
