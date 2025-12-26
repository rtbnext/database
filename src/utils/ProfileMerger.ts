import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TProfileData } from '@/types/profile';
import { CmpStr, CmpStrResult } from 'cmpstr';

CmpStr.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( /-(family|\d+)$/i, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStr.create( { metric: 'dice', safeEmpty: true } );
    private static readonly index = ProfileIndex.getInstance();

    private static similarURIs ( uri: string ) : string[] {
        const revUri = uri.split( '-' ).reverse().join( '-' );
        const keys = [ ...ProfileMerger.index.getIndex().keys() ];
        return [ ...new Set( [
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, uri, 0.9 ).map( i => i.source ),
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, revUri, 0.8 ).map( i => i.source )
        ] ) ];
    }

    public static mergeableProfiles ( target: TProfileData, source: TProfileData ) : boolean {
        if ( target.id === source.id ) return true;

        for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
            test in target.info && test in source.info &&
            JSON.stringify( ( target.info as any )[ test ] ) !==
            JSON.stringify( ( source.info as any )[ test ] )
        ) return false;

        return true;
    }

    public static mergeProfiles (
        target: Profile, source: Profile, force: boolean = false, makeAlias: boolean = true
    ) : boolean {
        if ( ! force && ! ProfileMerger.mergeableProfiles(
            target.getData(), source.getData()
        ) ) return false;

        const aliases = makeAlias ? [ source.getUri() ] : [];
        target.updateData( source.getData(), aliases, 'unique' );
        target.mergeHistory( source.getHistory() );
        target.save();

        return Profile.delete( source.getUri() );
    }

    public static findMatching ( data: Partial< TProfileData > ) : Profile[] {
        if ( ! data.id || ! data.uri ) return [];
        const res: Profile[] = [];

        for ( const uri of ProfileMerger.similarURIs( data.uri ) ) {
            const profile = Profile.get( uri );
            if ( profile && ProfileMerger.mergeableProfiles(
                profile.getData(), data as TProfileData
            ) ) res.push( profile );
        }

        return res;
    }

    public static listCandidates ( ...uriLike: any[] ) : Record< string, string[] > {
        if ( ! uriLike.length ) return {};
        const res: Record< string, string[] > = {};

        for ( const uri of uriLike ) {
            const profile = Profile.get( uri );
            if ( ! profile ) continue;
            const matches = this.findMatching( profile.getData() );
            res[ profile.getUri() ] = matches.map( m => m.getUri() );
        }

        return res;
    }

}
