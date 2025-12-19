import { ProfileIndex } from '@/collection/ProfileIndex';
import { Storage } from '@/core/Storage';
import { TEducation, TImage, TMetaData, TRelation } from '@/types/generic';
import { TProfileData, TProfileHistory, TProfileHistoryItem, TProfileIndexItem } from '@/types/profile';
import { TProfileResponse } from '@/types/response';
import { Relationship } from '@/utils/Const';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
import { join } from 'node:path';
import deepmerge from 'deepmerge';

export class Profile {

    private static readonly storage = Storage.getInstance();
    private static readonly index = ProfileIndex.getInstance();

    private uri: string;
    private path: string;
    private item: TProfileIndexItem;
    private data?: TProfileData;
    private history?: TProfileHistory;
    private meta: TMetaData;

    private constructor ( item?: TProfileIndexItem ) {
        if ( ! item ) throw new Error( `Profile index item not given` );

        this.uri = item.uri;
        this.path = join( 'profile', item.uri );
        this.item = item;

        this.meta = Profile.storage.readJSON< TMetaData >( join( this.path, 'meta.json' ) ) || {
            schemaVersion: 2, lastModified: new Date().toISOString()
        };
    }

    private touch () : void {
        this.meta!.lastModified = new Date().toISOString();
    }

    private updateIndex ( aliases: string[] = [] ) : void {
        if ( this.getData() ) this.item = {
            uri: this.uri, name: this.data!.info.name,
            aliases: Utils.mergeArray( this.item.aliases, aliases, 'unique' ),
            text: this.data!.bio.cv.join( ' ' )
        };
    }

    public getUri () : string {
        return this.uri;
    }

    public getMeta () : TMetaData {
        return this.meta;
    }

    public schemaVersion () : number {
        return this.meta.schemaVersion;
    }

    public modified () : string {
        return this.meta.lastModified;
    }

    public getData () : TProfileData {
        return this.data ||= Profile.storage.readJSON< TProfileData >(
            join( this.path, 'profile.json' )
        ) as TProfileData;
    }

    public setData ( data: TProfileData, aliases?: string[] ) : void {
        this.data = data;
        this.updateIndex( aliases );
        this.touch();
    }

    public updateData (
        data: Partial< TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace'
    ) : void {
        this.data = deepmerge< TProfileData >( this.getData(), data, {
            arrayMerge: ( t, s ) => Utils.mergeArray( t, s, mode )
        } );
        this.updateIndex( aliases );
        this.touch();
    }

    public getHistory () : TProfileHistory {
        return this.history ||= Profile.storage.readCSV< TProfileHistory >(
            join( this.path, 'history.csv' )
        ) as TProfileHistory;
    }

    public setHistory ( history: TProfileHistory ) : void {
        this.history = history;
        this.touch();
    }

    public addHistory ( row: TProfileHistoryItem ) : void {
        const history = this.getHistory();
        history.push( row );
        this.history = history;
        this.touch();
    }

    public save () : void {
        Profile.index.update( this.uri, this.item );
        Profile.storage.ensurePath( this.path );
        if ( this.data ) Profile.storage.writeJSON< TProfileData >( join( this.path, 'profile.json' ), this.data );
        if ( this.history ) Profile.storage.writeCSV< TProfileHistory >( join( this.path, 'history.csv' ), this.history );
        if ( this.meta ) Profile.storage.writeJSON< TMetaData >( join( this.path, 'meta.json' ), this.meta );
    }

    public move ( uriLike: string, makeAlias: boolean = true ) : boolean {
        const newUri = Utils.sanitize( uriLike );
        const item = Profile.index.move( this.uri, newUri, makeAlias );
        if ( ! item ) return false;

        const oldPath = this.path;
        this.uri = newUri;
        this.path = join( 'profile', newUri );
        this.item = item;
        Profile.storage.move( oldPath, this.path );

        this.updateData( { uri: newUri } );
        this.save();
        return true;
    }

    public static get ( uriLike: string ) : Profile | false {
        try { return new Profile( Profile.index.get( uriLike ) ) }
        catch { return false }
    }

    public static find ( uriLike: string ) : Profile | false {
        try { return new Profile( Profile.index.find( uriLike ).values().next().value ) }
        catch { return false }
    }

    public static create (
        uriLike: string, data: TProfileData, history?: TProfileHistory, aliases: string[] = []
    ) : Profile | false {
        const uri = Utils.sanitize( uriLike );
        const item = Profile.index.add( uri, { uri, name: data.info.name, aliases, text: data.bio.cv.join( ' ' ) } );
        if ( ! item ) return false;

        const profile = new Profile( item );
        profile.setData( data );
        profile.setHistory( history ?? [] );
        profile.save();

        return profile;
    }

    public static delete ( uriLike: string ) : boolean {
        const uri = Utils.sanitize( uriLike );
        const path = join( 'profile', uri );

        try {
            if ( ! Profile.storage.remove( path ) ) return false;
            Profile.index.delete( uri ); return true;
        } catch { return false }
    }

}


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
                caption: { value: item.caption, method: 'string' },
                desc: { value: item.description, method: 'string' }
            } )
        ) );
    }

}
