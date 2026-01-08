import * as S from '@rtbnext/schema/src/model/stats';

export interface IStats {
    getGlobalStats () : S.TGlobalStats;
    getDBStats () : S.TDBStats;
    getHistory () : S.THistory;
    getProfileStats () : S.TProfileStats;
    getWealthStats () : S.TWealthStats;
    getScatter () : S.TScatter;
}
