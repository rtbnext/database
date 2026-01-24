import { IListParser } from '@/interfaces/parser';
import { TListResponse } from '@/types/response';

export class ListParser implements IListParser {

    constructor ( private readonly raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ] ) {}

}
