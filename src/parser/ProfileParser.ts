import { TProfileResponse } from '@/types/response';

export class ProfileParser {

    private readonly raw: TProfileResponse[ 'person' ];
    private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];

    constructor ( res: TProfileResponse ) {
        this.raw = res.person;
        this.lists = res.person.personLists.sort(
            ( a, b ) => Number( b.date ?? 0 ) - Number( a.date ?? 0 )
        );
    }

}
