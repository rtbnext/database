import { REGEX_FAMILY, REGEX_SPACE_DELIMITER } from '@/core/RegEx';
import { Utils } from '@/core/Utils';
import { IProfileParser } from '@/interfaces/parser';
import { Parser } from '@/parser/Parser';
import { TParsedProfileName } from '@/types/parser';
import { TProfileResponse } from '@/types/response';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

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

    public name () : TParsedProfileName {
        return this.cache( 'name', () => ProfileParser.name(
            this.raw.name, this.raw.lastName, this.raw.firstName,
            Parser.boolean( this.raw.asianFormat )
        ) );
    }

    public info () : TProfileData[ 'info' ] {
        return this.cache( 'info', () => ( {
            ...Parser.container< Partial< TProfileData[ 'info' ] > >( {
                deceased: { value: this.raw.deceased, type: 'boolean' },
                embargo: { value: this.raw.embargo, type: 'boolean' },
                gender: { value: this.raw.gender, type: 'gender' },
                birthDate: { value: this.raw.birthDate, type: 'date' },
                birthPlace: { value: {
                    country: this.raw.birthCountry,
                    state: this.raw.birthState,
                    city: this.raw.birthCity
                }, type: 'location' },
                residence: { value: {
                    country: this.raw.countryOfResidence,
                    state: this.raw.stateProvince,
                    city: this.raw.city
                }, type: 'location' },
                maritalStatus: { value: this.raw.maritalStatus, type: 'maritalStatus' },
                children: { value: this.raw.numberOfChildren, type: 'number' },
                industry: { value: this.raw.industries, type: 'industry' },
                source: { value: this.raw.source, type: 'list' }
            } ),
            ...this.name()
        } as TProfileData[ 'info' ] ) );
    }

    public static name (
        value: any, lastName: any = undefined, firstName: any = undefined,
        asianFormat: boolean = false
    ) : TParsedProfileName {
        const clean = Parser.string( value ).replace( REGEX_FAMILY, '' ).trim();
        const family = REGEX_FAMILY.test( value );
        const parts = clean.split( REGEX_SPACE_DELIMITER ).filter( Boolean );

        const fN = firstName ? Parser.string( firstName ) : (
            asianFormat ? parts.slice( 1 ).join( ' ' ) : parts.slice( 0, -1 ).join( ' ' )
        );
        const lN = lastName ? Parser.string( lastName.replace( REGEX_FAMILY, '' ) ) : (
            asianFormat ? parts[ 0 ] || '' : parts.pop() || ''
        );

        return {
            name: clean + ( family ? ' & family' : '' ),
            shortName: `${ fN.split( ' ' )[ 0 ] } ${lN}`.trim(),
            lastName: lN, firstName: fN, family
        };
    }

}
