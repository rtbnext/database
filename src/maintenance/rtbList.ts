import { Maintenance } from '../core/Maintenance';

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

class RTBList extends Maintenance {

    public async run () : Promise< void > {

        this.logger.info( `Fetch daily real-time billionaires list` );

        const res = await this.fetch.request< RTBResponse >(
            this.config.endpoints.list.replace( '{URI}', 'rtb' )
        );

        if ( ! res.success || ! res.data ) { this.logger.error( res.error || '' ) } else {

            const list = res.data?.personList?.personsLists ?? [];
            // proceed list data ...

        }

    }

}

export const rtbList = new RTBList();
