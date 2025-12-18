export const QueueType = [ 'profile', 'list' ] as const;
export type QueueType = ( typeof QueueType )[ number ];

export interface TQueueItem {
    uri: string;
    ts: string;
    prio?: number;
}

export type TQueue = { [ K in QueueType ]: Map< string, TQueueItem > };

export type TQueueStorage = { [ K in QueueType ]: TQueueItem[] };
