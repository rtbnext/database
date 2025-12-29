import { Storage } from '@/core/Storage';
import { TScatter } from '@/types/stats';

export class Stats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {}

    public scatter ( data?: TScatter ) : TScatter {
        if ( data ) Stats.storage.writeJSON< TScatter >( 'stats/scatter.json', data );
        return data ?? ( Stats.storage.readJSON< TScatter >( 'stats/scatter.json' ) || [] );
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
