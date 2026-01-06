import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { ISnapshot } from '@/interfaces/snapshot';
import { TSnapshot } from '@rtbnext/schema/src/abstract/generic';

export abstract class Snapshot< T extends TSnapshot > implements ISnapshot< T > {

    protected static readonly storage = Storage.getInstance();
    protected dates: string[];

    protected constructor (
        protected readonly path: string,
        protected readonly ext: 'json' | 'csv' = 'json'
    ) {
        Snapshot.storage.ensurePath( this.path, true );
        this.dates = this.scanDates();
    }

    protected scanDates () : string[] {
        return Utils.sort( Snapshot.storage.scanDir( this.path ) );
    }

}
