import { Storage } from '@/core/Storage';
import { TScatter } from '@/types/stats';

export class Stats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {}

    public getScatter () : TScatter {
        return Stats.storage.readJSON< TScatter >( 'stats/scatter.json' ) || [];
    }

    public setScatter ( data: TScatter ) : void {
        Stats.storage.writeJSON< TScatter >( 'stats/scatter.json', data );
    }

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
