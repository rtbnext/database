import { TStatsGroup } from '@rtbnext/schema/src/abstract/const';
import * as S from '@rtbnext/schema/src/model/stats';

export interface IStats {
    getGlobalStats () : S.TGlobalStats;
    getProfileStats () : S.TProfileStats;
    getWealthStats () : S.TWealthStats;
    getScatter () : S.TScatter;
    getHistory () : S.THistory;
    getDBStats () : S.TDBStats;
    setGlobalStats ( data: Partial< S.TGlobalStats > ) : boolean;
    setProfileStats ( data: Partial< S.TProfileStats > ) : boolean;
    setWealthStats ( data: Partial< S.TWealthStats > ) : boolean;
    setScatter ( data: Partial< S.TScatter > ) : boolean;
    updateHistory ( data: Partial< S.TGlobalStats > ) : boolean;
    generateDBStats () : boolean;
    setGroupedStats< T extends string = string > (
        group: TStatsGroup, raw: Record< T, S.TStatsGroupItem >
    ) : boolean;
}
