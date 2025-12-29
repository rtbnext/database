import { Job, jobRunner } from '@/abstract/Job';
import { Filter } from '@/collection/Filter';
import { Profile } from '@/collection/Profile';
import { Stats } from '@/collection/Stats';
import { ProfileIndex } from '@/collection/ProfileIndex';
import { TFilter, TFilterCollection } from '@/types/filter';
import { TArgs } from '@/types/generic';
import { TScatter } from '@/types/stats';
import { Parser } from '@/utils/Parser';

export class UpdateStats extends Job {

    private readonly stats = Stats.getInstance();

    constructor ( silent: boolean, safeMode: boolean ) {
        super( silent, safeMode, 'UpdateStats' );
    }

    public async run ( args: TArgs ) : Promise< void > {
        await this.protect( async () => {
            const stats: any = { industry: {}, citizenship: {} };
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
                const woman = info.gender === 'f';
                const fItem: TFilter = { uri, name: info.shortName ?? info.name };
                const sItem = { ...fItem, gender: info.gender, age, networth };
                
                if ( info.industry ) ( filter.industry[ info.industry ] ??= [] ).push( fItem );
                if ( info.citizenship ) ( filter.citizenship[ info.citizenship ] ??= [] ).push( fItem );
                if ( info.residence?.country ) ( filter.country[ info.residence.country ] ??= [] ).push( fItem );
                if ( info.residence?.state ) ( filter.state[ info.residence.state ] ??= [] ).push( fItem );
                if ( info.gender ) ( filter.gender[ info.gender ] ??= [] ).push( fItem );
                if ( info.birthDate ) ( filter.age[ Parser.ageDecade( info.birthDate )! ] ??= [] ).push( fItem );
                if ( info.maritalStatus ) ( filter.maritalStatus[ info.maritalStatus ] ??= [] ).push( fItem );
                if ( info.deceased ) filter.special.deceased.push( fItem );
                if ( info.dropOff ) filter.special.dropOff.push( fItem );
                if ( info.family ) filter.special.family.push( fItem );
                if ( info.selfMade?.is ) filter.special.selfMade.push( fItem );

                if ( info.gender && age && networth ) scatter.push( sItem as any );

                [ 'industry', 'citizenship' ].forEach( key => {
                    const k = ( info as any )[ key ];
                    if ( k && networth ) {
                        let s = stats[ key ][ k ];
                        s = s || { count: 0, total: 0, woman: 0, first: { ...sItem, rank } };
                        s.count++; s.total += networth; s.woman += +woman;
                        if ( rank! < s.first.rank ) s.first = { ...sItem, rank };
                    }
                } );
            }

            Filter.getInstance().save( filter );
        } );
    }

}

jobRunner( UpdateStats );
