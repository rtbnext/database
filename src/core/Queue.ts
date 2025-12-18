import { ConfigLoader } from '@/core/ConfigLoader';
import { Storage } from '@/core/Storage';
import { TQueueConfig } from '@/types/config';
import { QueueType, TQueue, TQueueItem, TQueueStorage } from '@/types/queue';
import { Logger } from '@/utils/Logger';

export class Queue {

    private static instance: Queue;
    private readonly storage: Storage;
    private readonly logger: Logger;
    private readonly config: TQueueConfig;
    private queue: TQueue;

    private constructor () {
        this.storage = Storage.getInstance();
        this.logger = Logger.getInstance();
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
        this.storage.writeJSON< TQueueStorage >( 'queue.json', Object.fromEntries(
            QueueType.map( t => [ t, Array.from( this.queue[ t ].values() ) ] )
        ) as TQueueStorage );
    }

    public static getInstance () {
        return Queue.instance ||= new Queue();
    }

}
