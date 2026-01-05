import { Storage } from '@/core/Storage';
import { IFilter } from '@/interfaces/filter';

export class Filter implements IFilter {

    private static readonly storage = Storage.getInstance();
    private static instance: Filter;

    private constructor () {}

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
