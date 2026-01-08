import { StatsGroup } from '@/core/Const';
import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { IStats } from '@/interfaces/stats';
import * as S from '@rtbnext/schema/src/model/stats';
import { join } from 'node:path';

export class Stats implements IStats {

    private static readonly storage = Storage.getInstance();
    private static instance: Stats;

    private constructor () {
        this.initDB();
    }

    private initDB () : void {
        log.debug( 'Initializing stats storage paths' );
        StatsGroup.forEach( group => Stats.storage.ensurePath( this.resolvePath( group ), true ) );
    }

    // Private helper

    private resolvePath ( path: string ) : string {
        return join( 'stats', path );
    }

    private getStats< T > ( path: string, format: 'json' | 'csv' ) : T {
        return ( ( Stats.storage[ format === 'csv' ? 'readCSV' : 'readJSON' ] as any )
            ( this.resolvePath( path ) ) || ( format === 'csv' ? [] : {} ) ) as T;
    }

    private saveStats< T > ( path: string, format: 'json' | 'csv', data: T ) : boolean {
        return ( Stats.storage[ format === 'csv' ? 'writeCSV' : 'writeJSON' ] as any )
            ( this.resolvePath( path ), data );
    }

    // Stats getter

    public getGlobalStats () : S.TGlobalStats {
        return this.getStats< S.TGlobalStats >( 'global.json', 'json' );
    }

    public getDBStats () : S.TDBStats {
        return this.getStats< S.TDBStats >( 'db.json', 'json' );
    }

    public getHistory () : S.THistory {
        return this.getStats< S.THistory >( 'history.csv', 'csv' );
    }

    public getProfileStats () : S.TProfileStats {
        return this.getStats< S.TProfileStats >( 'profile.json', 'json' );
    }

    public getWealthStats () : S.TWealthStats {
        return this.getStats< S.TWealthStats >( 'wealth.json', 'json' );
    }

    public getScatter () : S.TScatter {
        return this.getStats< S.TScatter >( 'scatter.json', 'json' );
    }

    // Instantiate

    public static getInstance () : Stats {
        return Stats.instance ||= new Stats();
    }

}
