import { log } from '@/core/Logger';
import { Storage } from '@/core/Storage';
import { Utils } from '@/core/Utils';
import { ISnapshot } from '@/interfaces/snapshot';
import { Parser } from '@/parser/Parser';
import { TSnapshot } from '@rtbnext/schema/src/abstract/generic';
import { join } from 'node:path';

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

    // Private helpers

    protected scanDates () : string[] {
        return Utils.sort( Snapshot.storage.scanDir( this.path ) );
    }

    protected datedPath ( date: string ) : string {
        return join( this.path, `${date}.${this.ext}` );
    }

    // Basic snapshot getters

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

    // Special snapshot getters

    public nearestDate ( dateLike: string ) : string | undefined {
        const target = Parser.date( dateLike )!;
        return this.dates.slice().reduce( ( nearest, date ) => date > target ? nearest : date );
    }

    public datesInRange ( from: string, to: string ) : string[] {
        const fromDate = Parser.date( from )!, toDate = Parser.date( to )!;
        return this.dates.filter( date => date >= fromDate && date <= toDate );
    }

    public firstInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.find( date => date.substring( 0, 4 ) === target );
    }

    public latestInYear ( year: string | number ) : string | undefined {
        const target = Parser.string( year );
        return this.dates.filter( date => date.substring( 0, 4 ) === target ).at( -1 );
    }

    // Get snapshot data

    public getSnapshot ( dateLike: string, exactMatch: boolean = true ) : T | false {
        const target = Parser.date( dateLike )!;
        const date = this.hasDate( target ) ? target : exactMatch
            ? undefined : this.nearestDate( target );

        return date ? Snapshot.storage.readJSON< T >( this.datedPath( date ) ) : false;
    }

    public getLatest () : T | false {
        return this.dates.length ? this.getSnapshot( this.latestDate()! ) : false;
    }

    // Save snapshot data

    public saveSnapshot ( snapshot: T, force: boolean = false ) : boolean {
        log.debug( `Saving snapshot for date ${snapshot.date}` );
        return log.catch( () => {
            if ( ! force && this.hasDate( snapshot.date ) ) {
                throw new Error( `Snapshot for date ${snapshot.date} already exists` );
            }

            const path = this.datedPath( snapshot.date );
            if ( ! Snapshot.storage.writeJSON< T >( path, snapshot ) ) {
                throw new Error( `Failed to write snapshot to ${path}` );
            }

            this.dates = this.scanDates();
            return true;
        }, `Failed to save snapshot for date ${snapshot.date}` ) ?? false;
    }

}
