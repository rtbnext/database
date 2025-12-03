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

        this.logger.info( `Proceed ${list.length} list entries ...` );

        list.forEach( ( entry, i ) => {

            const listData = Parser.mapObject< ListItem >( {
                rank: { value: entry.rank, type: 'number' },
                networth: { value: entry.finalWorth, type: 'number', args: [ 3 ] },
                gender: { value: entry.gender, type: 'gender' },
                age: { value: entry.birthDate, type: 'age' },
                citizenship: { value: entry.countryOfCitizenship, type: 'country' },
                industry: { value: ( entry.industries || [] ).shift(), type: 'industry' },
                source: { value: entry.source, type: 'list' }
            } );

        } );

    }

}
