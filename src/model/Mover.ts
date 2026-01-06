import { Snapshot } from '@/abstract/Snapshot';
import { Utils } from '@/core/Utils';
import { ISnapshot } from '@/interfaces/snapshot';
import { TMover, TMoverEntry } from '@rtbnext/schema/src/model/mover';

export class Mover extends Snapshot< TMover > implements ISnapshot< TMover > {

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
            date: snapshot.date,
            today: {
                networth: { winner: winner[ 0 ], loser: loser[ 0 ] },
                percent: { winner: winner[ 1 ], loser: loser[ 1 ] }
            },
            ytd: {
                networth: { winner: winner[ 2 ], loser: loser[ 2 ] },
                percent: { winner: winner[ 3 ], loser: loser[ 3 ] }
            }
        }, force );
    }

    // Instantiate

    public static getInstance () : Mover {
        return this.instance ||= new Mover();
    }

}
