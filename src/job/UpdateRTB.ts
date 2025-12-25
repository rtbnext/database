import { Job, jobRunner } from '@/abstract/Job';
import { List } from '@/collection/List';
import { Profile } from '@/collection/Profile';
import { Stats } from '@/collection/Stats';
import { TRTBItem } from '@/types/list';
import { TMover } from '@/types/mover';
import { TProfileData } from '@/types/profile';
import { TListResponse } from '@/types/response';
import { ListParser } from '@/utils/ListParser';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
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
            const listDate = new Date().toISOString().split( 'T' )[ 0 ];
            if ( rtStats.date === listDate ) throw new Error( 'RTB list is already up to date' );

            this.log( `Processing RTB list dated ${listDate} (${raw.length} items)` );
            const th = Date.now() - this.config.queue.profileAge;
            const entries = raw.filter( i => i.rank && i.finalWorth ).filter( Boolean );

            let count = 0, woman = 0, total = 0;
            const items: TRTBItem[] = [];
            const movers: TMover = {
                date: listDate,
                today: { networth: { winner: [], loser: [] }, percent: { winner: [], loser: [] } },
                ytd: { networth: { winner: [], loser: [] }, percent: { winner: [], loser: [] } }
            };

            for ( const [ i, row ] of Object.entries( entries ) ) {
                const parser = new ListParser( row );

                const uri = parser.uri();
                const id = parser.id();
                const rank = parser.rank()!;
                const networth = parser.networth()!;
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
                    this.log( `Updating profile: ${uri}` );
                    if ( profile.modifiedTime() < th ) this.queue.add( 'profile', uri );
                    profile.updateData( profileData as any );
                    profile.save();

                    if ( uri !== profile.getUri() ) {
                        this.log( `Renaming profile from ${ profile.getUri() } to ${uri}` );
                        profile.move( uri, true );
                    }
                } else if ( isSimilar && profile ) {
                    this.log( `Merging data into existing profile: ${ profile.getUri() }` );
                    profile.updateData( profileData as any );
                    profile.move( uri, true );
                    this.queue.add( 'profile', uri, undefined, 5 );
                } else {
                    this.log( `Creating profile: ${uri}` );
                    profile = Profile.create( uri, profileData as TProfileData, [] );
                    this.queue.add( 'profile', uri, undefined, 10 );
                }

                const prev = entries[ Number( i ) - 1 ]?.uri;
                const next = entries[ Number( i ) + 1 ]?.uri;
                const realtime = parser.realtime( profileData as any, prev, next );
                const { value = 0, pct = 0 } = realtime?.today ?? {};

                if ( realtime?.today?.value ) {
                    movers.today.networth[ realtime.today.value > 0 ? 'winner' : 'loser' ].push( {
                        uri, name: profileData.info.shortName!, value
                    } );
                    movers.today.percent[ realtime.today.pct > 0 ? 'winner' : 'loser' ].push( {
                        uri, name: profileData.info.shortName!, value: pct
                    } );
                }

                if ( realtime?.ytd?.value ) {
                    movers.ytd.networth[ realtime.ytd.value > 0 ? 'winner' : 'loser' ].push( {
                        uri, name: profileData.info.shortName!, value: realtime.ytd.value
                    } );
                    movers.ytd.percent[ realtime.ytd.pct > 0 ? 'winner' : 'loser' ].push( {
                        uri, name: profileData.info.shortName!, value: realtime.ytd.pct
                    } );
                }

                if ( profile ) {
                    profile.updateData( { realtime } );
                    profile.addHistory( [ listDate, rank, networth, value, pct ] );
                    profile.save();
                    profileData = profile.getData();
                } else {
                    this.log( `Missing profile after creation/merging: ${uri}`, undefined, 'warn' );
                }

                items.push( {
                    uri, rank, networth,
                    today: realtime?.today,
                    ytd: realtime?.ytd,
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

            const list = List.get( 'rtb' ) || List.create( 'rtb', {
                uri: 'rtb',
                name: 'The World’s Real-Time Billionaires',
                shortName: 'Real-Time Billionaires',
                desc: 'Today’s richest people in the world',
                text: 'todays richest people world',
                date: listDate, count,
                columns: [ 'rank', 'profile', 'networth', 'today', 'ytd', 'age', 'citizenship', 'source' ],
                filters: [ 'gender', 'industry', 'citizenship' ]
            } );

            if ( ! list ) throw new Error( 'Failed to create or retrieve RTB list' );
            this.log( `Saving RTB list dated ${listDate} (${items.length} items)` );
            list.saveSnapshot( { ...Utils.metaData(), date: listDate, items, stats: {
                count, total, woman, quote: woman / count * 100
            } } );

            // save movers ...

            rtStats.date = listDate;
            rtStats.count = Parser.number( count );
            rtStats.totalWealth = Parser.money( total );
            rtStats.womanCount = Parser.number( woman );
            this.stats.setRealtime( rtStats );
        } );
    }

}

jobRunner( UpdateRTB );
