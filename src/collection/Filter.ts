import { Storage } from '@/core/Storage';
import { TFilterCollection } from '@/types/filter';

export class Filter {

    private static instance: Filter;
    private static readonly storage = Storage.getInstance();

    private data?: TFilterCollection;

    private constructor () {}

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
