import { TRTBListItem } from '@rtbnext/schema/src/model/list';
import { TProfileData } from '@rtbnext/schema/src/model/profile';
import { TGenericStats } from '@rtbnext/schema/src/model/stats';

import { Job, jobRunner } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { IJob } from '@/interfaces/job';
import { List } from '@/model/List';
import { Mover } from '@/model/Mover';
import { Stats } from '@/model/Stats';
import { ListParser } from '@/parser/ListParser';
import { Parser } from '@/parser/Parser';
import { TQueueOptions } from '@/types/queue';
import { TListResponse } from '@/types/response';
import { ProfileManager } from '@/utils/ProfileManager';

export class RTBJob extends Job implements IJob {

    private static readonly fetch = Fetch.getInstance();
    private static readonly queue = ProfileQueue.getInstance();
    private static readonly stats = Stats.getInstance();

    constructor ( args: string[] ) {
        super( args, 'RTB' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const res = await RTBJob.fetch.list< TListResponse >( 'rtb', '0', this.args.date );
            if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

            const { date } = RTBJob.stats.getGlobalStats();
            const listDate = Parser.date( this.args.date ?? new Date(), 'ymd' )!;
            if ( date === listDate ) throw new Error( 'RTB list is already up to date' );

            const rawList = res.data.personList.personsLists;
            const th = Date.now() - Job.config.queue.tsThreshold;
            const entries = rawList.filter( i => i.rank && i.finalWorth ).filter( Boolean ).sort(
                ( a, b ) => a.rank! - b.rank!
            );

            this.log( `Processing RTB list dated ${listDate} (${entries.length} items)` );

            // Process list data
            let count = 0, total = 0, woman = 0;
            const items: TRTBListItem[] = [];
            const mover = Mover.factory( listDate );
            const queue: TQueueOptions[] = [];

            for ( const [ i, raw ] of Object.entries( entries ) ) {
                raw.date = new Date( listDate ).getTime();

                // Parse raw list data
                const parser = new ListParser( raw );
                const uri = parser.uri();
                const id = parser.id();
                const rank = parser.rank();
                const networth = parser.networth();

                if ( ! rank || ! networth ) {
                    this.log( `Skipping invalid RTB entry for ${uri}` );
                    continue;
                }

                let profileData: Partial< TProfileData > = {
                    uri, id, info: parser.info(), bio: parser.bio(),
                    assets: parser.assets()
                } as Partial< TProfileData >;

                // Process profile using ProfileManager
                const { profile, action } = ProfileManager.process(
                    uri, id, profileData, [], 'updateData'
                );

                if ( ! profile ) {
                    this.log( `Failed to process profile for ${uri}` );
                    continue;
                }

                ProfileManager.updateQueue( queue, profile, action, th );
                profileData = profile.getData();

                // Process realtime data
                const prev = entries[ Number( i ) - 1 ]?.uri;
                const next = entries[ Number( i ) + 1 ]?.uri;
                const realtime = parser.realtime( profileData, prev, next );
                const { value = 0, pct = 0 } = realtime?.today ?? {};

                profile.updateData( { realtime } );
                profile.addHistory( [ listDate, rank, networth, value, pct ] );
                profile.save();

                profileData = profile.getData();
                const name = profileData.info?.shortName ?? profileData.info?.name!;

                // Aggregate mover data
                Mover.aggregate( realtime, uri, name, mover );

                // Push list item
                items.push( {
                    uri, rank, networth, name,
                    gender: profileData.info?.gender,
                    age: parser.age(),
                    today: realtime?.today,
                    ytd: realtime?.ytd,
                    citizenship: profileData.info?.citizenship,
                    industry: profileData.info?.industry!,
                    source: profileData.info?.source!
                } );

                count++; total += networth;
                woman += +( profileData.info?.gender === 'f' );
            }

            // Save list data
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
            this.log( `Saving RTB list dated ${listDate} (${count} items)` );

            const stats = Parser.container< TGenericStats >( {
                date: { value: listDate, type: 'string' },
                count: { value: count, type: 'number' },
                total: { value: total, type: 'money' },
                woman: { value: woman, type: 'number' },
                quota: { value: ( woman / count ) * 100, type: 'pct' }
            } );

            list.saveSnapshot( { date: listDate, count, items, stats } );
            Mover.getInstance().saveSnapshot( mover );
            RTBJob.queue.addMany( queue );
        } );
    }

}

jobRunner( RTBJob );
