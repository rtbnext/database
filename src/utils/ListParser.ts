import { TAsset, TRealtime } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TListResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

export class ListParser {

    constructor ( private readonly raw: TListResponse[ 'personList' ][ 'personsLists' ][ number ] ) {}

    public date () : string {
        return Parser.date( this.raw.date || this.raw.timestamp, 'ymd' )!
    }

    public rank () : number | undefined {
        return Parser.strict( this.raw.rank, 'number' );
    }

    public networth () : number | undefined {
        return Parser.strict( this.raw.finalWorth, 'money' );
    }

    public dropOff () : boolean | undefined {
        return this.raw.finalWorth ? this.raw.finalWorth < 1e3 : undefined;
    }

    public uri () : string {
        return Utils.sanitize( this.raw.uri );
    }

    public id () : string {
        return Utils.hash( this.raw.naturalId );
    }

    public name () : ReturnType< typeof Parser.name > {
        return Parser.name( this.raw.person?.name ?? this.raw.personName, this.raw.lastName );
    }

    public info () : Partial< TProfileData[ 'info' ] > {
        return Parser.container< Partial< TProfileData[ 'info' ] > >( {
            dropOff: { value: this.dropOff(), method: 'boolean' },
            gender: { value: this.raw.gender, method: 'gender' },
            birthDate: { value: this.raw.birthDate, method: 'date' },
            citizenship: { value: this.raw.countryOfCitizenship, method: 'country' },
            industry: { value: this.raw.industries?.[ 0 ], method: 'industry' },
            source: { value: this.raw.source, method: 'list' }
        } );
    }

    public bio () : TProfileData[ 'bio' ] {
        return Parser.container< TProfileData[ 'bio' ] >( {
            cv: { value: this.raw.bios, method: 'list' },
            facts: { value: this.raw.abouts, method: 'list' },
            quotes: { value: [], method: 'list' }
        } );
    }

    public age () : number | undefined {
        return Parser.strict( this.raw.birthDate, 'age' );
    }

    public assets () : TAsset[] {
        return ( this.raw.financialAssets ?? [] ).map( a => ( {
            ...Parser.container< TAsset >( {
                type: { value: 'public', method: 'string' },
                label: { value: a.companyName, method: 'string' },
                value: { value: a.numberOfShares && a.currentPrice
                    ? a.numberOfShares * a.currentPrice / 1e6
                    : undefined, method: 'money' }
            } ),
            info: Parser.container< TAsset[ 'info' ] >( {
                exchange: { value: a.exchange, method: 'string' },
                ticker: { value: a.ticker, method: 'string' },
                shares: { value: a.numberOfShares, method: 'number' },
                price: { value: a.currentPrice ?? a.sharePrice, method: 'number', args: [ 6 ] },
                currency: { value: a.currencyCode, method: 'string' },
                exRate: { value: a.exchangeRate, method: 'number', args: [ 6 ] }
            } )
        } ) );
    }

    public realtime ( data?: Partial< TProfileData >, prev?: string, next?: string ) : TRealtime | undefined {
        if ( ! this.raw.finalWorth ) return;
        const lastDay = data?.realtime?.networth ?? 0;
        const dailyChange = this.raw.finalWorth - lastDay;
        const lastYear = data?.annual?.sort( ( a, b ) => b.year - a.year )?.[ 0 ]?.networth?.last ?? 0;
        const ytdChange = this.raw.finalWorth - lastYear;

        return {
            date: this.date(), rank: this.rank(), networth: this.networth(), prev, next,
            today: data && data.realtime && lastDay ? {
                value: Parser.money( dailyChange ),
                pct: Parser.pct( dailyChange / lastDay * 100 )
            } : undefined,
            ytd: data && data.annual?.length && lastYear ? {
                value: Parser.money( ytdChange ),
                pct: Parser.pct( ytdChange / lastYear * 100 )
            } : undefined
        };
    }

}
