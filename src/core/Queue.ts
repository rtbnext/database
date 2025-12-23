import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { TQueueConfig } from '@/types/config';
import { TQueue, TQueueItem, TQueueStorage } from '@/types/queue';
import { QueueType } from '@/utils/Const';
import { Utils } from '@/utils/Utils';

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

    public getQueue ( type: QueueType ) : TQueueItem[] {
        return Array.from( this.queue[ type ].values() );
    }

    public size ( type: QueueType ) : number {
        return this.queue[ type ].size;
    }

    public has ( type: QueueType, uriLike: string ) : boolean {
        return this.queue[ type ].has( Utils.sanitize( uriLike ) );
    }

    public add ( type: QueueType, uriLike: string, args?: Record< string, any >, prio?: number ) : boolean {
        if ( ! QueueType.includes( type ) || this.queue[ type ]?.size > this.config.maxSize ) return false;

        const uri = Utils.sanitize( uriLike );
        const item = this.queue[ type ].get( uri );
        const ts = item?.ts || new Date().toISOString();
        const data: TQueueItem = { uri, ts, args, prio };

        if ( JSON.stringify( item ) === JSON.stringify( data ) ) return false;

        log.debug( `Add to queue [${type}]: ${uri} (prio: ${ prio ?? this.config.defaultPrio })` );
        this.queue[ type ].set( uri, data );
        this.saveQueue();

        return true;
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

    public clear ( type: QueueType ) {
        this.queue[ type ].clear();
        this.saveQueue();
    }

    public static getInstance () {
        return Queue.instance ||= new Queue();
    }

}
