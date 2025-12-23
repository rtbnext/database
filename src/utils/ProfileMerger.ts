import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TProfileData } from '@/types/profile';
import { Utils } from '@/utils/Utils';
import { CmpStr, CmpStrResult } from 'cmpstr';

CmpStr.filter.add( 'input', 'normalizeUri', ( uri: string ) : string =>
    uri.replace( /-(family|\d+)$/i, '' )
);

export class ProfileMerger {

    private static readonly cmp = CmpStr.create( { metric: 'dice', safeEmpty: true } );
    private static readonly index = ProfileIndex.getInstance();

    private static similarURIs ( uri: string ) : string[] {
        return ProfileMerger.cmp.match< CmpStrResult[] >(
            [ ...ProfileMerger.index.getIndex().keys() ], uri, 0.5
        ).map( i => i.source );
    }

    private static mergeableProfiles ( target: TProfileData, source: TProfileData ) : boolean {
        if ( target.id === source.id ) return true;

        for ( const test of [ 'gender', 'birthDate', 'birthPlace', 'citizenship' ] ) if (
            test in target.info && test in source.info &&
            JSON.stringify( ( target.info as any )[ test ] ) !==
            JSON.stringify( ( source.info as any )[ test ] )
        ) return false;

        return true;
    }

    public static mergeProfiles (
        target: Profile, source: Profile, force: boolean = false, makeAlias: boolean = true
    ) : void {
        if ( ! force && ! ProfileMerger.mergeableProfiles( target.getData(), source.getData() ) ) return;

        const aliases = makeAlias ? [ source.getUri() ] : [];
        target.updateData( source.getData(), aliases, 'unique' );
        target.mergeHistory( source.getHistory() );
        target.save();

        Profile.delete( source.getUri() );
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

}
