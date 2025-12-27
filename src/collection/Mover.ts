import { Dated } from '@/abstract/Dated';
import { TMover } from '@/types/mover';

export class Mover extends Dated< TMover > {

    private static instance: Mover;

    private constructor () {
        super( 'mover' );
    }

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
