import { TEducation, TImage, TRelation } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TProfileResponse } from '@/types/response';
import { Relationship } from '@/utils/Const';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class ProfileParser {

    private readonly raw: TProfileResponse[ 'person' ];
    private readonly lists: TProfileResponse[ 'person' ][ 'personLists' ];

    constructor ( res: TProfileResponse ) {
        this.raw = res.person;
        this.lists = res.person.personLists.sort( ( a, b ) => b.date - a.date );
    }

    public uri () : string {
        return Utils.sanitize( this.raw.uri );
    }

    public id () : string {
        return Utils.hash( this.raw.naturalId );
    }

    public aliases () : string[] {
        const uri = this.uri();
        return this.raw.uris.filter( Boolean ).map( i => Utils.sanitize( i ) )
            .filter( i => i !== uri ).sort();
    }

    public name () : ReturnType< typeof Parser.name > {
        return Parser.name(
            this.raw.name, this.raw.lastName, this.raw.firstName,
            Parser.boolean( this.raw.asianFormat )
        );
    }

    public info () : TProfileData[ 'info' ] {
        return {
            ...Parser.container< Partial< TProfileData[ 'info' ] > >( {
                deceased: { value: this.raw.deceased, method: 'boolean' },
                dropOff: { value: this.raw.dropOff, method: 'boolean' },
                embargo: { value: this.raw.embargo, method: 'boolean' },
                gender: { value: this.raw.gender, method: 'gender' },
                birthDate: { value: this.raw.birthDate, method: 'date' },
                birthPlace: { value: {
                    country: this.raw.birthCountry,
                    state: this.raw.birthState,
                    city: this.raw.birthCity
                }, method: 'location' },
                residence: { value: {
                    country: this.raw.countryOfResidence,
                    state: this.raw.stateProvince,
                    city: this.raw.city
                }, method: 'location' },
                maritalStatus: { value: this.raw.maritalStatus, method: 'maritalStatus' },
                children: { value: this.raw.numberOfChildren, method: 'number' },
                industry: { value: this.raw.industries, method: 'industry' },
                source: { value: this.raw.source, method: 'list' }
            } ),
            ...this.name(),
            citizenship: this.citizenship(),
            education: this.education(),
            selfMade: this.selfMade(),
            philanthropyScore: this.philanthropyScore(),
            organization: this.organization()
        } as TProfileData[ 'info' ];
    }

    public citizenship () : string | undefined {
        return Parser.strict(
            this.raw.countryOfCitizenship ||
            this.raw.countryOfResidence,
            'country'
        );
    }

    public education () : TProfileData[ 'info' ][ 'education' ] {
        return ( this.raw.educations ?? [] ).filter( Boolean ).map( item => (
            Parser.container< TEducation >( {
                school: { value: item.school, method: 'string' },
                degree: { value: item.degree, method: 'string' }
            } )
        ) );
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
        if ( ! this.raw.organization ) return;
        return Parser.container< TProfileData[ 'info' ][ 'organization' ] >( {
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

    public related () : TProfileData[ 'related' ] {
        return ( this.raw.relatedEntities ?? [] ).filter( Boolean ).map( item => ( {
            uri: item.uri ? Utils.sanitize( item.uri ) : undefined,
            ...Parser.container< TRelation >( {
                type: { value: item.type, method: 'map', args: [ Relationship ] },
                name: { value: item.name, method: 'string' },
                relation: { value: item.relationshipType, method: 'string' }
            } )
        } ) );
    }

    public media () : TProfileData[ 'media' ] {
        return ( this.raw.listImages ?? [] ).filter( Boolean ).map( item => (
            Parser.container< TImage >( {
                url: { value: item.uri, method: 'string' },
                credits: { value: item.credit, method: 'string' },
                file: { value: item.image, method: 'string' },
                caption: { value: item.caption, method: 'cleanStr' },
                desc: { value: item.description, method: 'cleanStr' }
            } )
        ) );
    }

}
