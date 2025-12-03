import { ListItem } from '@rtbnext/schema/src/collection/list';
import { Maintenance } from '../core/Maintenance';
import { Parser } from '../core/Parser';

export interface RTBResponse {
    personList: {
        personsLists: {
            uri: string;
            rank: number;
            finalWorth: number;
            person: {
                name: string;
            };
            personName: string;
            state?: string;
            city?: string;
            source?: string;
            industries: string[];
            countryOfCitizenship: string;
            gender: string;
            birthDate: number;
            lastName: string;
            financialAssets: {
                exchange: string;
                ticker: string;
                companyName: string;
                numberOfShares?: number;
                sharePrice: number;
                currencyCode: string;
                exchangeRate?: number;
            }[];
            familyList: boolean;
            bios: string[];
            abouts: string[];
        }[];
    }
};

export class RTBList extends Maintenance {

    public async run () : Promise< void > {

        this.logger.info( `Fetch daily real-time billionaires list` );

        const res = await this.fetch.request< RTBResponse >( this.config.endpoints.list.replace( '{URI}', 'rtb' ) );
        if ( ! res.success || ! res.data ) this.logger.exit( res.error || '' );

        const list = res.data?.personList?.personsLists ?? [];
        if ( ! list || list.length === 0 ) this.logger.exit( 'Empty list' );

        list.forEach( ( entry, i ) => {

            const listData: ListItem = {
                rank: Parser.number( entry.rank ),
                networth: Parser.number( entry.finalWorth, 3 ),
                gender: Parser.gender( entry.gender ),
                age: Parser.age( entry.birthDate ),
                citizenship: Parser.country( entry.countryOfCitizenship ),
                industry: Parser.industry( entry.industries.shift() ),
                source: Parser.list( entry.source )
            };

        } );

    }

}
