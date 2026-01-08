import * as S from '@rtbnext/schema/src/model/stats';

export interface IStats {
    getGlobalStats () : S.TGlobalStats;
    getHistory () : S.THistory;
    getProfileStats () : S.TProfileStats;
    getWealthStats () : S.TWealthStats;
    getScatter () : S.TScatter;
    getDBStats () : S.TDBStats;
    setGlobalStats ( data: Partial< S.TGlobalStats > ) : boolean;
    updateHistory ( data: Partial< S.TGlobalStats > ) : boolean;
    generateDBStats () : boolean;
}
