export class Storage {

    private static instance: Storage;

    private constructor () {}

    public static getInstance () : Storage {
        return Storage.instance ||= new Storage();
    }

}
