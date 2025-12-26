import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { TQueueConfig } from '@/types/config';
import { TQueue, TQueueItem, TQueueOptions, TQueueStorage } from '@/types/queue';
import { QueueType } from '@/utils/Const';
import { Utils } from '@/utils/Utils';
import { sha256 } from 'js-sha256';

export class Queue {

    private static instance: Queue;
    private readonly storage: Storage;
    private readonly config: TQueueConfig;
    private queue: TQueue;

    private constructor () {
        this.storage = Storage.getInstance();
        this.config = Config.getInstance().queue;
        this.queue = this.loadQueue();
    }

    private loadQueue () : TQueue {
        const raw = this.storage.readJSON< TQueueStorage >( 'queue.json' ) || {};
        return QueueType.reduce( ( acc, t ) => {
            acc[ t ] = new Map( ( ( raw as any )[ t ] || [] ).map(
                ( i: TQueueItem ) => [ i.uri, i ]
            ) );
            return acc;
        }, {} as TQueue );
    }

    private saveQueue () : void {
        const { defaultPrio } = this.config;
        this.storage.writeJSON< TQueueStorage >( 'queue.json', Object.fromEntries(
            QueueType.map( t => [ t, Array.from( this.queue[ t ].values() ).sort( ( a, b ) =>
                ( b.prio ?? defaultPrio ) - ( a.prio ?? defaultPrio ) || 
                ( new Date( a.ts ).getTime() - new Date( b.ts ).getTime() )
            ) ] )
        ) as TQueueStorage );
    }

    private key ( uri: string, args?: any ) : string {
        return sha256( uri + JSON.stringify( args ) );
    }

    public getQueue ( type: QueueType ) : TQueueItem[] {
        return Array.from( this.queue[ type ].values() );
    }

    public size ( type: QueueType ) : number {
        return this.queue[ type ].size;
    }

    public getByUri ( type: QueueType, uriLike: string ) : TQueueItem[] {
        const uri = Utils.sanitize( uriLike );
        return [ ...this.queue[ type ].values() ].filter( i => i.uri === uri );
    }

    public hasUri ( type: QueueType, uriLike: string ) : boolean {
        return this.getByUri( type, uriLike ).length !== 0;
    }

    public add ( opt: TQueueOptions, save: boolean = true ) : boolean {
        const { type, uriLike, args, prio } = opt;
        try {
            if ( ! QueueType.includes( type ) ) throw new Error( `Invalid queue type provided: ${ type }` );
            if ( this.queue[ type ].size > this.config.maxSize ) throw new Error( `Queue size limit reached for type: ${ type }` );

            const uri = Utils.sanitize( uriLike );
            const key = this.key( uri, args );
            const item = this.queue[ type ].get( key );
            const ts = item?.ts || new Date().toISOString();
            const data: TQueueItem = { key, uri, ts, args, prio };

            if ( JSON.stringify( item ) === JSON.stringify( data ) ) return false;

            log.debug( `Add to queue [${type}]: ${uri} (prio: ${ prio ?? this.config.defaultPrio })` );
            this.queue[ type ].set( key, data );
            if ( save ) this.saveQueue();

            return true;
        } catch ( err ) {
            log.warn( ( err as Error ).message );
            return false;
        }
    }

    public addMany ( items: TQueueOptions[] ) : number {
        const added = items.reduce( ( acc, item ) => acc + +this.add( item, false ), 0 );
        this.saveQueue();
        return added;
    }

    public next ( type: QueueType, n: number = 1 ) : TQueueItem[] {
        const items: TQueueItem[] = [];

        for ( const [ k, item ] of this.queue[ type ] ) {
            if ( items.length < n ) {
                items.push( item );
                this.queue[ type ].delete( k );
            } else break;
        }

        this.saveQueue();
        return items;
    }

    public nextUri ( type: QueueType, n: number = 1 ) : string[] {
        return this.next( type, n ).filter( Boolean ).map( i => i.uri );
    }

    public clear ( type: QueueType ) : void {
        log.debug( `Clear queue [${type}]` );
        this.queue[ type ].clear();
        this.saveQueue();
    }

    public static getInstance () : Queue {
        return Queue.instance ||= new Queue();
    }

}
