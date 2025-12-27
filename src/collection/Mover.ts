export class Mover {

    private static instance: Mover;

    private constructor () {}

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
