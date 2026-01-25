import * as M from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import { IMover } from '@/interfaces/mover';
import { Parser } from '@/parser/Parser';
import { TChangeItem, TRealtime } from '@rtbnext/schema/src/abstract/assets';

export class Mover extends Snapshot< M.TMover > implements IMover {

    private static instance: Mover;

    private constructor () {
        super( 'mover', 'json' );
    }

    // Prepare mover entries

    private prep ( arr: M.TMoverEntry[], dir: 'asc' | 'desc' = 'asc' ) : M.TMoverEntry[] {
        return arr.sort( ( a, b ) => dir === 'asc' ? a.value - b.value : b.value - a.value )
            .slice( 0, 10 );
    }

    private prepWinner ( snapshot: Omit< M.TMover, '@metadata' > ) : M.TMoverEntry[][] {
        return [
            snapshot.today.networth.winner, snapshot.today.percent.winner,
            snapshot.ytd.networth.winner, snapshot.ytd.percent.winner
        ].map( a => this.prep( a, 'desc' ) );
    }

    private prepLoser ( snapshot: Omit< M.TMover, '@metadata' > ) : M.TMoverEntry[][] {
        return [
            snapshot.today.networth.loser, snapshot.today.percent.loser,
            snapshot.ytd.networth.loser, snapshot.ytd.percent.loser
        ].map( a => this.prep( a, 'asc' ) );
    }

    // Save snapshot data

    public saveSnapshot ( snapshot: Omit< M.TMover, '@metadata' >, force?: boolean ) : boolean {
        const winner = this.prepWinner( snapshot );
        const loser = this.prepLoser( snapshot );

        return super.saveSnapshot( {
            ...Utils.metaData(),
            ...Parser.container< Omit< M.TMover, '@metadata' > >( {
                date: { value: snapshot.date, type: 'date' },
                today: { value: Parser.container< M.TMoverItem >( {
                    total: { value: Parser.container< TChangeItem >( {
                        value: { value: snapshot.today.total.value, type: 'money' },
                        pct: { value: snapshot.today.total.pct, type: 'pct' }
                    } ), type: 'container' },
                    networth: { value: Parser.container< M.TMoverSubject >( {
                        winner: { value: winner[ 0 ], type: 'money' },
                        loser: { value: loser[ 0 ], type: 'money' }
                    } ), type: 'container' },
                    percent: { value: Parser.container< M.TMoverSubject >( {
                        winner: { value: winner[ 1 ], type: 'pct' },
                        loser: { value: loser[ 1 ], type: 'pct' }
                    } ), type: 'container' }
                } ), type: 'container' },
                ytd: { value: Parser.container< M.TMoverItem >( {
                    total: { value: Parser.container< TChangeItem >( {
                        value: { value: snapshot.ytd.total.value, type: 'money' },
                        pct: { value: snapshot.ytd.total.pct, type: 'pct' }
                    } ), type: 'container' },
                    networth: { value: Parser.container< M.TMoverSubject >( {
                        winner: { value: winner[ 2 ], type: 'money' },
                        loser: { value: loser[ 2 ], type: 'money' }
                    } ), type: 'container' },
                    percent: { value: Parser.container< M.TMoverSubject >( {
                        winner: { value: winner[ 3 ], type: 'pct' },
                        loser: { value: loser[ 3 ], type: 'pct' }
                    } ), type: 'container' }
                } ), type: 'container' }
            } )
        } as M.TMover, force );
    }

    // Instantiate

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

    // Aggregate mover data

    public static aggregate (
        data: TRealtime | undefined, uri: string, name: string,
        col: Omit< M.TMover, '@metadata' >
    ) : void {
        if ( data?.today?.value ) {
            const type = data.today.value > 0 ? 'winner' : 'loser';
            col.today.total.value += data.today.value;
            col.today.total.pct += data.today.pct;
            col.today.networth[ type ].push( { uri, name, value: data.today.value } );
            col.today.percent[ type ].push( { uri, name, value: data.today.pct } );
        }

        if ( data?.ytd?.value ) {
            const type = data.ytd.value > 0 ? 'winner' : 'loser';
            col.ytd.total.value += data.ytd.value;
            col.ytd.total.pct += data.ytd.pct;
            col.ytd.networth[ type ].push( { uri, name, value: data.ytd.value } );
            col.ytd.percent[ type ].push( { uri, name, value: data.ytd.pct } );
        }
    }

    // Factory method

    public static factory ( date?: any ) : Omit< M.TMover, '@metadata' > {
        return {
            date: Parser.date( date ?? new Date(), 'ymd' )!,
            today: {
                total: { value: 0, pct: 0 },
                networth: { winner: [], loser: [] },
                percent: { winner: [], loser: [] }
            },
            ytd: {
                total: { value: 0, pct: 0 },
                networth: { winner: [], loser: [] },
                percent: { winner: [], loser: [] }
            }
        };
    }

}
