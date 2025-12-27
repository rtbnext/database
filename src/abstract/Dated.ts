import { Storage } from '@/core/Storage';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
import { join } from 'node:path';

export abstract class Dated< T > {

    protected readonly storage: Storage;
    protected dates: string[];

    constructor (
        protected readonly path: string,
        protected readonly ext: 'json' | 'csv' = 'json'
    ) {
        this.storage = Storage.getInstance();
        this.storage.ensurePath( this.path );
        this.dates = this.scanDates();
    }

    protected scanDates () : string[] {
        return Utils.sort( this.storage.scanDir( this.path ) );
    }

    protected datedPath ( date: string ) : string {
        return join( this.path, `${date}.${this.ext}` );
    }

    public getDates () : string[] {
        return this.dates;
    }

    public hasDate ( dateLike: string ) : boolean {
        return this.dates.includes( Parser.date( dateLike, 'ymd' )! );
    }

    public firstDate () : string | undefined {
        return this.dates[ 0 ];
    }

    public latestDate () : string | undefined {
        return this.dates.at( -1 );
    }

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().reduce(
            ( nearest, date ) => date > target ? nearest : date
        );
    }

    public datesInRange ( from: string, to: string ) : string[] {
        const fromDate = Parser.date( from )!;
        const toDate = Parser.date( to )!;
        return this.dates.filter( date => date >= fromDate && date <= toDate );
    }

    public latestInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
    }

    public getSnapshot ( dateLike: string, exactMatch: boolean = true ) : T | false {
        const target = Parser.date( dateLike )!;
        const date = this.hasDate( target ) ? target : exactMatch ? undefined : this.nearestDate( target );
        return date ? this.storage.readJSON< T >( this.datedPath( date ) ) : false;
    }

    public getLatest () : T | false {
        return this.dates.length ? this.getSnapshot( this.latestDate()! ) : false;
    }

    public saveSnapshot ( date: string, snapshot: T, force: boolean = false ) : boolean {
        if ( ! force && this.hasDate( date ) ) return false;
        if ( ! this.storage.writeJSON< T >( this.datedPath( date ), snapshot ) ) return false;
        this.dates = this.scanDates();
        return true;
    }

}
