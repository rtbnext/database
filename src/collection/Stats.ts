import { Storage } from '@/core/Storage';
import { TRealtimeStats } from '@/types/stats';

export class Stats {

    private static instance: Stats;
    private readonly storage: Storage;
    private data: Record< string, any > = {};

    private constructor () {
        this.storage = Storage.getInstance();
    }

    public rt () : TRealtimeStats {
        return this.data.rt ||= this.storage.readJSON< TRealtimeStats >( 'stats/rt.json' ) || {};
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
