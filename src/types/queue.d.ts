import { QueueType } from '@/utils/Const';

export interface TQueueOptions {
    type: QueueType;
    uriLike: string;
    args?: Record< string, any >;
    prio?: number;
}

export interface TQueueItem {
    readonly key: string;
    readonly uri: string;
    ts: string;
    args?: Record< string, any >;
    prio?: number;
}

export type TQueue = { [ K in QueueType ]: Map< string, TQueueItem > };

export type TQueueStorage = { [ K in QueueType ]: TQueueItem[] };
