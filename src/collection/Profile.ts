import { TEducation } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TProfileResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
import { DeepPartial } from 'devtypes/types/collections';

export class Profile {

    public static parser ( raw: TProfileResponse[ 'person' ] ) : DeepPartial< TProfileData > {
        const cv: string[] = [], facts: string[] = [];
        let philanthropyScore: number | undefined = undefined;

        for ( const item of ( raw.personLists ).sort( ( a, b ) => b.date - a.date ) ) {
            if ( cv.length === 0 ) cv.push( ...Utils.unique( item.bios ?? [] ) );
            if ( facts.length === 0 ) facts.push( ...Utils.unique( item.abouts ?? [] ) );
            if ( ! philanthropyScore ) philanthropyScore = item.philanthropyScore;
            if ( cv.length > 0 && facts.length > 0 && philanthropyScore ) break;
        }

        return {
            uri: Utils.sanitize( raw.uri ),
            info: {
                ...Parser.name( raw.name, raw.lastName, raw.firstName, Parser.boolean( raw.asianFormat ) ),
                ...Parser.container< Partial< TProfileData[ 'info' ] > >( {
                    deceased: { value: raw.deceased, method: 'boolean' },
                    dropOff: { value: raw.dropOff, method: 'boolean' },
                    embargo: { value: raw.embargo, method: 'boolean' },
                    gender: { value: raw.gender, method: 'gender' },
                    birthDate: { value: raw.birthDate, method: 'date' },
                    birthPlace: { value: { country: raw.birthCountry, state: raw.birthState, city: raw.birthCity }, method: 'location' },
                    citizenship: { value: raw.countryOfCitizenship || raw.countryOfResidence, method: 'country' },
                    residence: { value: { country: raw.countryOfResidence, state: raw.stateProvince, city: raw.city }, method: 'location' },
                    maritalStatus: { value: raw.maritalStatus, method: 'maritalStatus' },
                    children: { value: raw.numberOfChildren, method: 'number' },
                    industry: { value: raw.industries, method: 'industry' },
                    source: { value: raw.source, method: 'list' },
                    philanthropyScore: { value: philanthropyScore, method: 'number' }
                } ),
                education: ( raw.educations ?? [] ).map( ( { school, degree } ) => Parser.container< TEducation >( {
                    school: { value: school, method: 'string' },
                    degree: { value: degree, method: 'string' }
                } ) ),
                selfMade: Parser.container< TProfileData[ 'info' ][ 'selfMade' ] >( {
                    type: { value: raw.selfMadeType, method: 'string' },
                    is: { value: raw.selfMade, method: 'boolean' },
                    rank: { value: raw.selfMadeRank, method: 'number' }
                } ),
                organization: raw.organization ? Parser.container< TProfileData[ 'info' ][ 'organization' ] >( {
                    name: { value: raw.organization, method: 'string' },
                    title: { value: raw.title, method: 'string' }
                } ) : undefined
            },
            bio: Parser.container< TProfileData[ 'bio' ] > ( {
                cv: { value: cv, method: 'list' },
                facts: { value: facts, method: 'list' },
                quotes: { value: raw.quote, method: 'list' }
            } )
        };
    }

}

export class ProfileParser {

    private readonly raw: TProfileResponse[ 'person' ];
    private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];

    constructor ( res: TProfileResponse ) {
        this.raw = res.person;
        this.lists = res.person.personLists.sort( ( a, b ) => b.date - a.date );
    }

    public name () : ReturnType< typeof Parser.name > {
        return Parser.name(
            this.raw.name, this.raw.lastName, this.raw.firstName,
            Parser.boolean( this.raw.asianFormat )
        );
    }

    public education () : TProfileData[ 'info' ][ 'education' ] {
        if ( this.raw.educations ) return this.raw.educations.map( ( { school, degree } ) => (
            Parser.container< TEducation >( {
                school: { value: school, method: 'string' },
                degree: { value: degree, method: 'string' }
            } ) )
        );
    }

    public selfMade () : TProfileData[ 'info' ][ 'selfMade' ] {
        return Parser.container< TProfileData[ 'info' ][ 'selfMade' ] >( {
            type: { value: this.raw.selfMadeType, method: 'string' },
            is: { value: this.raw.selfMade, method: 'boolean' },
            rank: { value: this.raw.selfMadeRank, method: 'number' }
        } );
    }

    public philanthropyScore () : number | undefined {
        return Utils.aggregate( this.lists, 'philanthropyScore', 'first' ) as number | undefined;
    }

    public organization () : TProfileData[ 'info' ][ 'organization' ] {
        if ( this.raw.organization ) return Parser.container< TProfileData[ 'info' ][ 'organization' ] >( {
            name: { value: this.raw.organization, method: 'string' },
            title: { value: this.raw.title, method: 'string' }
        } );
    }

    public bio () : TProfileData[ 'bio' ] {
        return {
            cv: this.cv(), facts: this.facts(),
            quotes: Parser.list( [ this.raw.quote ] ) as string[]
        };
    }

    public cv () : string[] {
        return Utils.aggregate( this.lists, 'bios', 'first' ) as string[];
    }

    public facts () : string[] {
        return Utils.aggregate( this.lists, 'abouts', 'first' ) as string[];
    }

}
