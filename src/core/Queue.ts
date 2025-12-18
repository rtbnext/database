import { ConfigLoader } from '@/core/ConfigLoader';
import { Storage } from '@/core/Storage';
import { TQueueConfig } from '@/types/config';
import { QueueType, TQueue, TQueueItem, TQueueStorage } from '@/types/queue';
import { Utils } from '@/utils/Utils';

export class Queue {

    private static instance: Queue;
    private readonly storage: Storage;
    private readonly config: TQueueConfig;
    private queue: TQueue;

    private constructor () {
        this.storage = Storage.getInstance();
        this.config = ConfigLoader.getInstance().queue;
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
            QueueType.map( t => [ t, Array.from( this.queue[ t ].values() ).sort(
                ( a, b ) => ( b.prio ?? defaultPrio ) - ( a.prio ?? defaultPrio )
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

    public add ( type: QueueType, uriLike: string, prio?: number ) : boolean {
        if ( this.queue[ type ].size > this.config.maxSize ) return false;
        const uri = Utils.sanitize( uriLike );
        this.queue[ type ].set( uri, { uri, prio, ts: new Date().toISOString() } );
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

    public clear ( type: QueueType ) {
        this.queue[ type ].clear();
        this.saveQueue();
    }

    public static getInstance () {
        return Queue.instance ||= new Queue();
    }

}
