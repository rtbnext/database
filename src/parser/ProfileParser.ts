import { RelationType } from '@/core/Const';
import { REGEX_FAMILY, REGEX_SPACE_DELIMITER } from '@/core/RegEx';
import { Utils } from '@/core/Utils';
import { IProfileParser } from '@/interfaces/parser';
import { Parser } from '@/parser/Parser';
import { TParsedProfileName } from '@/types/parser';
import { TProfileResponse } from '@/types/response';
import * as Generic from '@rtbnext/schema/src/abstract/generic';
import { TProfileBio, TProfileInfo } from '@rtbnext/schema/src/model/profile';

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

    // Caching

    private cache< T = any > ( key: string, fn: () => T ) : T {
        if ( ! this.cachedData.has( key ) ) this.cachedData.set( key, fn() );
        return this.cachedData.get( key );
    }

    // Raw data

    public rawData () : TProfileResponse[ 'person' ] {
        return this.raw;
    }

    public sortedLists () : TProfileResponse[ 'person' ][ 'personLists' ] {
        return this.lists;
    }

    // URIs & IDs

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

    // Profile parser

    public name () : TParsedProfileName {
        return this.cache( 'name', () => ProfileParser.name(
            this.raw.name, this.raw.lastName, this.raw.firstName,
            Parser.boolean( this.raw.asianFormat )
        ) );
    }

    public info () : TProfileInfo {
        return this.cache( 'info', () => ( {
            ...Parser.container< Partial< TProfileInfo > >( {
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
            ...this.name(),
            citizenship: this.citizenship(),
            education: this.education(),
            selfMade: this.selfMade(),
            philanthropyScore: this.philanthropyScore(),
            organization: this.organization()
        } as TProfileInfo ) );
    }

    public citizenship () : string | undefined {
        return this.cache( 'citizenship', () => Parser.strict(
            this.raw.countryOfCitizenship ||
            this.raw.countryOfResidence,
            'country'
        ) );
    }

    public education () : Generic.TEducation[] {
        return this.cache( 'education', () => ( this.raw.educations ?? [] )
            .filter( Boolean )
            .map( item => Parser.container< Generic.TEducation >( {
                school: { value: item.school, type: 'string' },
                degree: { value: item.degree, type: 'string' }
            } )
        ) );
    }

    public selfMade () : Generic.TSelfMade {
        return this.cache( 'selfMade', () =>
            Parser.container< Generic.TSelfMade >( {
                type: { value: this.raw.selfMadeType, type: 'string' },
                is: { value: this.raw.selfMade, type: 'boolean' },
                rank: { value: this.raw.selfMadeRank, type: 'number' }
            } )
        );
    }

    public philanthropyScore () : number | undefined {
        return this.cache( 'philanthropyScore', () =>
            Utils.aggregate( this.lists, 'philanthropyScore', 'first' ) as number | undefined
        );
    }

    public organization () : Generic.TOrganization | undefined {
        return this.cache( 'organization', () => {
            if ( this.raw.organization ) return Parser.container< Generic.TOrganization >( {
                name: { value: this.raw.organization, type: 'string' },
                title: { value: this.raw.title, type: 'string' }
            } );
        } );
    }

    public bio () : TProfileBio {
        return this.cache( 'bio', () => ( {
            cv: this.cv(), facts: this.facts(), quotes: this.quotes()
        } ) );
    }

    public cv () : string[] {
        return this.cache( 'cv', () => Parser.list< string >(
            Utils.aggregate( this.lists, 'bios', 'first' ) as string[], 'safeStr'
        ) );
    }

    public facts () : string[] {
        return this.cache( 'facts', () => Parser.list< string >(
            Utils.aggregate( this.lists, 'abouts', 'first' ) as string[], 'safeStr'
        ) );
    }

    public quotes () : string[] {
        return this.cache( 'quotes', () => Parser.list< string >(
            [ this.raw.quote ?? '' ], 'safeStr'
        ) );
    }

    public related () : Generic.TRelation[] {
        return this.cache( 'related', () => ( this.raw.relatedEntities ?? [] )
            .filter( Boolean ).map( item => ( {
                uri: item.uri ? Utils.sanitize( item.uri ) : undefined,
                ...Parser.container< Generic.TRelation >( {
                    type: { value: item.type, type: 'map', args: [ RelationType ] },
                    name: { value: item.name, type: 'string' },
                    relation: { value: item.relationshipType, type: 'string' }
                } )
            } ) )
        );
    }

    public media () : Generic.TImage[] {
        return this.cache( 'media', () => ( this.raw.listImages ?? [] )
            .filter( Boolean ).map( item => Parser.container< Generic.TImage >( {
                url: { value: item.uri, type: 'string' },
                credits: { value: item.credit, type: 'string' },
                file: { value: item.image, type: 'string' },
                caption: { value: item.caption, type: 'safeStr' },
                desc: { value: item.description, type: 'safeStr' }
            } ) )
        );
    }

    // Public methods

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
