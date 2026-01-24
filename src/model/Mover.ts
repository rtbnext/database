import * as M from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import { IMover } from '@/interfaces/mover';
import { Parser } from '@/parser/Parser';

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

    private prepWinner ( snapshot: M.TMover ) : M.TMoverEntry[][] {
        return [
            snapshot.today.networth.winner, snapshot.today.percent.winner,
            snapshot.ytd.networth.winner, snapshot.ytd.percent.winner
        ].map( a => this.prep( a, 'desc' ) );
    }

    private prepLoser ( snapshot: M.TMover ) : M.TMoverEntry[][] {
        return [
            snapshot.today.networth.loser, snapshot.today.percent.loser,
            snapshot.ytd.networth.loser, snapshot.ytd.percent.loser
        ].map( a => this.prep( a, 'asc' ) );
    }

    // Save snapshot data

    public saveSnapshot ( snapshot: M.TMover, force?: boolean ) : boolean {
        const winner = this.prepWinner( snapshot );
        const loser = this.prepLoser( snapshot );

        return super.saveSnapshot( {
            ...Utils.metaData(),
            ...Parser.container< Partial< M.TMover > >( {
                date: { value: snapshot.date, type: 'date' },
                today: { value: Parser.container< M.TMoverItem >( {
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

}
