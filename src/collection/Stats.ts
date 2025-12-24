export class Stats {

    private static instance: Stats;

    private constructor () {}

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
