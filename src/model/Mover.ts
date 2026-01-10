import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import { IMover } from '@/interfaces/mover';
import { Parser } from '@/parser/Parser';
import { TMover, TMoverEntry, TMoverItem, TMoverSubject } from '@rtbnext/schema/src/model/mover';

export class Mover extends Snapshot< TMover > implements IMover {

    private static instance: Mover;

    private constructor () {
        super( 'mover', 'json' );
    }

    // Prepare mover entries

    private prep ( arr: TMoverEntry[], dir: 'asc' | 'desc' = 'asc' ) : TMoverEntry[] {
        return arr.sort( ( a, b ) => dir === 'asc' ? a.value - b.value : b.value - a.value )
            .slice( 0, 10 );
    }

    private prepWinner ( snapshot: TMover ) : TMoverEntry[][] {
        return [
            snapshot.today.networth.winner, snapshot.today.percent.winner,
            snapshot.ytd.networth.winner, snapshot.ytd.percent.winner
        ].map( a => this.prep( a, 'desc' ) );
    }

    private prepLoser ( snapshot: TMover ) : TMoverEntry[][] {
        return [
            snapshot.today.networth.loser, snapshot.today.percent.loser,
            snapshot.ytd.networth.loser, snapshot.ytd.percent.loser
        ].map( a => this.prep( a, 'asc' ) );
    }

    // Save snapshot data

    public saveSnapshot ( snapshot: TMover, force?: boolean ) : boolean {
        const winner = this.prepWinner( snapshot );
        const loser = this.prepLoser( snapshot );

        return super.saveSnapshot( {
            ...Utils.metaData(),
            ...Parser.container< Partial< TMover > >( {
                date: { value: snapshot.date, type: 'date' },
                today: { value: Parser.container< TMoverItem >( {
                    networth: { value: Parser.container< TMoverSubject >( {
                        winner: { value: winner[ 0 ], type: 'money' },
                        loser: { value: loser[ 0 ], type: 'money' }
                    } ), type: 'container' },
                    percent: { value: Parser.container< TMoverSubject >( {
                        winner: { value: winner[ 1 ], type: 'pct' },
                        loser: { value: loser[ 1 ], type: 'pct' }
                    } ), type: 'container' }
                } ), type: 'container' },
                ytd: { value: Parser.container< TMoverItem >( {
                    networth: { value: Parser.container< TMoverSubject >( {
                        winner: { value: winner[ 2 ], type: 'money' },
                        loser: { value: loser[ 2 ], type: 'money' }
                    } ), type: 'container' },
                    percent: { value: Parser.container< TMoverSubject >( {
                        winner: { value: winner[ 3 ], type: 'pct' },
                        loser: { value: loser[ 3 ], type: 'pct' }
                    } ), type: 'container' }
                } ), type: 'container' }
            } )
        } as TMover, force );
    }

    // Instantiate

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
