export interface TResponse< T > {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    duration: number;
    retries: number;
}

export interface TProfileResponse {
    person: {
        name: string;
        listImages?: {
            image: string;
            uri: string;
            caption: string;
            description: string;
            title: string;
            credit: string;
        }[];
        geoLocation?: {
            longitude: number;
            latitude: number;
        };
        relatedEntities?: {
            name: string;
            type: string;
            uri?: string;
            relationshipType?: string;
        }[];
        uri: string;
        dropOff: boolean;
        uris: string[];
        industries: string[];
        embargo?: boolean;
        firstName?: string;
        lastName?: string;
        birthDate?: number;
        finalWorth: number;
        finalWorthDate: number;
        stateProvince?: string;
        city?: string;
        numberOfChildren?: number;
        maritalStatus?: 'M' | 'F';
        source: string;
        title?: string;
        organization?: string;
        asianFormat?: 'N' | 'Y';
        personLists: {
            listUri: string;
            rank: number;
            bio?: string;
            finalWorth: number;
            timestamp: string;
            financialAssets: {
                exchange: string;
                ticker: string;
                companyName: string;
                numberOfShares?: number;
                sharePrice: number;
                exchangeRate?: number;
                currentPrice?: number;
            }[];
            date: number;
            estWorthPrev: number;
            privateAssetsWorth: number;
            familyList: boolean;
            archivedWorth: number;
            bios?: string[];
            abouts?: string[];
            philanthropyScore?: number;
        }[];
        educations?: {
            school: string;
            degree: string;
        }[];
        selfMade?: boolean;
        gender: string;
        countryOfCitizenship: string;
        countryOfResidence?: string;
        birthCity?: string;
        birthState?: string;
        birthCountry?: string;
        deceased: boolean;
        selfMadeType?: string;
        selfMadeRank?: number;
        quote?: string;
    };
}

export interface TListResponse {}
