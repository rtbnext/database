import { Index } from '@/abstract/Index';

export class ListIndex extends Index {

    protected static instance: ListIndex;

    private constructor () {
        super();
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
