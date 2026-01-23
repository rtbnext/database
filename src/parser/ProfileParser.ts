import { Utils } from '@/core/Utils';
import { IProfileParser } from '@/interfaces/parser';
import { TProfileResponse } from '@/types/response';

export class ProfileParser implements IProfileParser {

    private readonly raw: TProfileResponse[ 'person' ];
    private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];
    private cachedData: Map< string, any > = new Map();

    constructor ( res: TProfileResponse ) {
        this.raw = res.person;
        this.lists = res.person.personLists.sort(
            ( a, b ) => Number( b.date ?? 0 ) - Number( a.date ?? 0 )
        );
    }

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    public uri () : string {
        return this.cache( 'uri', () => Utils.sanitize( this.raw.uri ) );
    }

    public id () : string {
        return this.cache( 'id', () => Utils.hash( this.raw.naturalId ) );
    }

    public aliases () : string[] {
        return this.cache( 'aliases', () => {
            const uri = this.uri();
            return this.raw.uris
                .filter( Boolean )
                .map( i => Utils.sanitize( i ) )
                .filter( i => i !== uri )
                .sort();
        } );
    }

    public name () : ReturnType< typeof ProfileParser.name > {
        return this.cache( 'name', () => ProfileParser.name(
            this.raw.name, this.raw.lastName, this.raw.firstName,
            Parser.boolean( this.raw.asianFormat )
        ) );
    }

    public static name () {}

}
