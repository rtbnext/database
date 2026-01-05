import { Config } from '@/core/Config';
import { FilterGroup } from '@/core/Const';
import { Storage } from '@/core/Storage';
import { IFilter } from '@/interfaces/filter';
import { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/abstract/const';
import { join } from 'node:path';

export class Filter implements IFilter {

    private static readonly storage = Storage.getInstance();
    private static instance: Filter;

    private readonly path: string;

    private constructor () {
        this.path = join( Config.getInstance().root, 'filter' );
    }

    // Path helper

    private splitPath ( path: string ) : [ TFilterGroup | 'special', string ] | undefined {
        const [ group, key ] = path.replace( '.json', '' ).split( '/' ).slice( -2 );
        return ( FilterGroup.includes( group as any ) || group === 'special' ) && key
            ? [ group as any, key ] : undefined;
    }

    private joinPath ( group?: TFilterGroup | 'special', key?: string ) : string | false {
        return group && key ? join( this.path, group, `${key}.json` ) : false;
    }

    private resolvePath ( path: string ) : string | false {
        return this.joinPath( ...( this.splitPath( path ) ?? [] ) as any );
    }

    // Instantiate

    public static getInstance () : Filter {
        return Filter.instance ||= new Filter();
    }

}
