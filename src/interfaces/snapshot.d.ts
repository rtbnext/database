import { TSnapshot } from '@rtbnext/schema/src/abstract/generic';

export interface ISnapshot< T extends TSnapshot > {
    getDates () : string[];
    hasDate ( dateLike: string ) : boolean;
    firstDate () : string | undefined;
    latestDate () : string | undefined;
    nearestDate ( dateLike: string ) : string | undefined;
    datesInRange ( from: string, to: string ) : string[];
    firstInYear ( year: string | number ) : string | undefined;
    latestInYear ( year: string | number ) : string | undefined;
    getSnapshot ( dateLike: string, exactMatch: boolean = true ) : T | false;
    getLatest () : T | false;
    saveSnapshot ( snapshot: T, force: boolean = false ) : boolean;
}

export type IMover = ISnapshot< TMover >;
