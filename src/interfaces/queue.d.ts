import { TQueueItem, TQueueOptions } from '@/types/queue';

export interface IQueue {
    getQueue () : TQueueItem[];
    size () : number;
    getByKey ( key: string ) : TQueueItem | undefined;
    hasKey ( key: string ) : boolean;
    getByUri ( uriLike: string ) : TQueueItem[];
    hasUri ( uriLike: string ) : boolean;
    clear () : void;
    add ( opt: TQueueOptions, save: boolean = true ) : boolean;
    addMany ( items: TQueueOptions[] ) : number;
    next ( n: number = 1 ) : TQueueItem[];
    nextUri ( n: number = 1 ) : string[];
}
