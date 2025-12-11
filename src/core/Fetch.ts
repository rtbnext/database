export class Fetch {

    private static instance: Fetch;

    private constructor () {}

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
