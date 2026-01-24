import { TProfileData } from '@rtbnext/schema/src/model/profile';
import { CmpStrAsync, CmpStrResult } from 'cmpstr';

import { REGEX_URI_CLEANUP } from '@/core/RegEx';
import { Profile } from '@/model/Profile';
import { ProfileIndex } from '@/model/ProfileIndex';

CmpStrAsync.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( REGEX_URI_CLEANUP, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStrAsync.create( { metric: 'dice', safeEmpty: true } );
    private static readonly index = ProfileIndex.getInstance();

    // Private helper

    private static similarURIs ( uri: string ) : string[] {
        const revUri = uri.split( '-' ).reverse().join( '-' );
        const keys = [ ...ProfileMerger.index.getIndex().keys() ];
        return [ ...new Set( [
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, uri, 0.9 ).map( i => i.source ),
            ...ProfileMerger.cmp.match< CmpStrResult[] >( keys, revUri, 0.8 ).map( i => i.source )
        ] ) ];
    }

    // Check mergeable profiles

    public static mergeableProfiles ( target: TProfileData, source: TProfileData ) : boolean {
        if ( target.id === source.id ) return true;

        for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship', 'industry' ] ) if (
            test in target.info && test in source.info &&
            JSON.stringify( ( target.info as any )[ test ] ) !==
            JSON.stringify( ( source.info as any )[ test ] )
        ) return false;

        return true;
    }

    // Find matching profiles

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

    // Prevent instantiation

    private constructor () {}

}
