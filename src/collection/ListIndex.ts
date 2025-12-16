import { Index } from '@/abstract/Index';

export class ListIndex extends Index< any > {

    protected static instance: ListIndex;

    private constructor () {
        super();
    }

    protected loadIndex () : any {
        return {};
    }

    public static getInstance () {
        return ListIndex.instance ||= new ListIndex();
    }

}
