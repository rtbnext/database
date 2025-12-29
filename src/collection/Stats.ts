import { Storage } from '@/core/Storage';

export class Stats {

    private static instance: Stats;
    private static readonly storage = Storage.getInstance();

    private constructor () {}

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
