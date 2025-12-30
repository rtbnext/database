import { Job, jobRunner } from '@/abstract/Job';
import { Filter } from '@/collection/Filter';
import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { Stats } from '@/collection/Stats';
import { TFilter, TFilterCollection } from '@/types/filter';
import { TAgePyramid, TScatter } from '@/types/stats';
import { StatsGroup } from '@/utils/Const';
import { Parser } from '@/utils/Parser';

export class UpdateStats extends Job {

    private readonly filter = Filter.getInstance();
    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateStats' );
    }

    public async run () : Promise< void > {
        await this.protect( async () => {
            const date = this.stats.getRealtime().date;
            if ( ! date ) throw new Error( `Needs to run after UpdateRTB job` );

            const agePyramid: TAgePyramid = { m: {}, f: {}, d: {} };
            const groups: any = { industry: {}, citizenship: {} };
            const scatter: TScatter = [];
            const filter: TFilterCollection = {
                industry: {}, citizenship: {}, country: {}, state: {}, gender: {}, age: {}, maritalStatus: {},
                special: { deceased: [], dropOff: [], family: [], selfMade: [] }
            };

            for ( const item of ProfileIndex.getInstance().getIndex().values() ) {
                const profile = Profile.getByItem( item );
                if ( ! profile ) continue;

                const { uri, info, realtime } = profile.getData();
                const networth = realtime?.networth;
                const rank = realtime?.rank;
                const age = Parser.age( info.birthDate );
                const decade = Parser.ageDecade( info.birthDate );
                const woman = info.gender === 'f';
                const fItem: TFilter = { uri, name: info.shortName ?? info.name };
                const sItem = { ...fItem, gender: info.gender, age, networth };
                const nItem = { ...fItem, rank, networth };
                
                if ( info.industry ) ( filter.industry[ info.industry ] ??= [] ).push( fItem );
                if ( info.citizenship ) ( filter.citizenship[ info.citizenship ] ??= [] ).push( fItem );
                if ( info.residence?.country ) ( filter.country[ info.residence.country ] ??= [] ).push( fItem );
                if ( info.residence?.state ) ( filter.state[ info.residence.state ] ??= [] ).push( fItem );
                if ( info.gender ) ( filter.gender[ info.gender ] ??= [] ).push( fItem );
                if ( decade ) ( filter.age[ decade ] ??= [] ).push( fItem );
                if ( info.maritalStatus ) ( filter.maritalStatus[ info.maritalStatus ] ??= [] ).push( fItem );
                if ( info.deceased ) filter.special.deceased.push( fItem );
                if ( info.dropOff ) filter.special.dropOff.push( fItem );
                if ( info.family ) filter.special.family.push( fItem );
                if ( info.selfMade?.is ) filter.special.selfMade.push( fItem );

                if ( info.gender && decade ) agePyramid[ info.gender ][ decade ]++;

                // The following stats only consider profiles updated in the same RTB run
                if ( realtime?.date !== date ) continue;

                if ( info.gender && age && networth ) scatter.push( sItem as any );

                StatsGroup.forEach( key => {
                    const k = ( info as any )[ key ];
                    if ( k && networth ) {
                        groups[ key ][ k ] ||= {
                            date, count: 0, total: 0, woman: 0, quota: 0, first: nItem,
                            today: { value: 0, pct: 0 }, ytd: { value: 0, pct: 0 }
                        };
                        groups[ key ][ k ].count++;
                        groups[ key ][ k ].total += networth;
                        groups[ key ][ k ].woman += +woman;
                        groups[ key ][ k ].quota = groups[ key ][ k ].woman / groups[ key ][ k ].count * 100;
                        if ( rank! < groups[ key ][ k ].first.rank ) groups[ key ][ k ].first = nItem;
                        groups[ key ][ k ].today.value += realtime.today?.value ?? 0;
                        groups[ key ][ k ].today.pct += realtime.today?.pct ?? 0;
                        groups[ key ][ k ].ytd.value += realtime.ytd?.value ?? 0;
                        groups[ key ][ k ].ytd.pct += realtime.ytd?.pct ?? 0;
                    }
                } );
            }

            this.filter.save( filter );
            this.stats.setGroupStats( 'industry', groups.industry );
            this.stats.setGroupStats( 'citizenship', groups.citizenship );
            this.stats.setScatter( scatter );
        } );
    }

}

jobRunner( UpdateStats );
