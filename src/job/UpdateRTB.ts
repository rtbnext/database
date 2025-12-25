import { Job, jobRunner } from '@/abstract/Job';
import { Profile } from '@/collection/Profile';
import { Stats } from '@/collection/Stats';
import { TRTBItem } from '@/types/list';
import { TProfileData } from '@/types/profile';
import { TListResponse } from '@/types/response';
import { ListParser } from '@/utils/ListParser';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { Parser } from '@/utils/Parser';
import deepmerge from 'deepmerge';

export class UpdateRTB extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateRTB' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const rtStats = this.stats.getRealtime();
            const res = await this.fetch.list< TListResponse >( 'rtb', '0' );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const raw = res.data.personList.personsLists;
            const listDate = Parser.date( raw[ 0 ].date || raw[ 0 ].timestamp, 'ymd' )!;
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            this.log( `Processing RTB list dated ${listDate} (${raw.length} items)` );
            const items: TRTBItem[] = [];
            let count = 0, woman = 0, total = 0;
            let prev: string, next: string;

            for ( const row of raw ) {
                const parser = new ListParser( row );

                const rank = parser.rank();
                const networth = parser.networth();
                if ( ! rank || ! networth ) continue;

                const uri = parser.uri();
                const id = parser.id();
                let profileData = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    assets: parser.assets()
                };

                let profile = Profile.find( uri );
                const isExisting = profile && profile.verify( id );
                const isSimilar = ! isExisting && ( profile = ProfileMerger.findMatching(
                    profileData = deepmerge< TProfileData >( profileData as TProfileData,
                        { info: { ...parser.name() } } as TProfileData
                    )
                )[ 0 ] );

                if ( isExisting && profile ) {
                    // update profile data + test age (queue)
                } else if ( isSimilar && profile ) {
                    // merge profile + add to queue (5)
                } else {
                    this.log( `Creating profile: ${uri}` );
                    profile = Profile.create( uri, profileData as TProfileData, [] );
                    this.queue.add( 'profile', uri, undefined, 10 );
                }

                // prev, next & realtime data

                if ( profile ) profileData = profile.getData();

                items.push( {
                    uri, rank, networth,
                    name: profileData.info.shortName!,
                    gender: profileData.info.gender,
                    age: parser.age(),
                    citizenship: profileData.info.citizenship,
                    industry: profileData.info.industry!,
                    source: profileData.info.source!
                } );

                count++;
                woman += +( profileData.info.gender === 'f' );
                total += networth;
            }

            rtStats.date = listDate;
            rtStats.count = Parser.number( count );
            rtStats.totalWealth = Parser.money( total );
            rtStats.womanCount = Parser.number( woman );
            this.stats.setRealtime( rtStats );
        } );
    }

}

jobRunner( UpdateRTB );
