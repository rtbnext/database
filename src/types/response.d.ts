export interface TResponse< T > {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    duration: number;
    retries: number;
}

export interface TWaybackResponse {
    archived_snapshots: {
        closest?: {
            status: string;
            available: boolean;
            url: string;
            timestamp: string;
        };
    };
}

export interface TProfileResponse {
    person: {
        naturalId: string;
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
            name: string;
            listDescription?: string;
            rank?: number;
            finalWorth?: number;
            timestamp: number | string;
            financialAssets?: {
                exchange: string;
                ticker: string;
                companyName: string;
                numberOfShares?: number;
                sharePrice: number;
                exchangeRate?: number;
                currentPrice?: number;
            }[];
            date?: number | string;
            estWorthPrev?: number;
            privateAssetsWorth?: number;
            familyList?: boolean;
            archivedWorth?: number;
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

export interface TListResponse {
    personList: {
        personsLists: {
            naturalId: string;
            name: string;
            year: number;
            listUri: string;
            uri: string;
            rank?: number;
            finalWorth?: number;
            person?: {
                name?: string;
                uri?: string;
            },
            personName: string;
            state?: string;
            city?: string;
            source?: string;
            industries?: string[];
            countryOfCitizenship?: string;
            timestamp: number;
            gender?: 'M' | 'F';
            birthDate?: number;
            lastName?: string;
            financialAssets?: {
                exchange: string;
                ticker: string;
                companyName: string;
                numberOfShares?: number;
                sharePrice?: number;
                currencyCode?: string;
                exchangeRate?: number;
                currentPrice?: number;
            }[];
            date?: number;
            estWorthPrev?: number;
            privateAssetsWorth?: number;
            archivedWorth?: number;
            csfDisplayFields: string[];
            bios?: string[];
            abouts?: string[];
        }[];
    };
}

export type TListResponseEntry = TListResponse[ 'personList' ][ 'personsLists' ][ number ];

export interface TWikidataResponse {
    results: { bindings: TWikidataResponseItem[] };
}

export type TWikidataResponseItem = {
    item: { value: string };
    itemLabel: { value: string, xmlLang: string };
} & { [ K in (
    | 'gender' | 'birthdate' | 'article' | 'image' | 'iso2'
    | 'occupation' | 'employer' | 'ownerOf' | 'netWorth'
) ]?: {
    value: string;
} };

export interface TWikipediaResponse {
    query: {
        pages: {
            pageid: number;
            title: string;
            extract?: string;
            touched: string;
            lastrevid: number;
            pageimage?: string;
            pageprops?: {
                [ K in (
                    | 'defaultsort' | 'wikibase-shortdesc' | 'wikibase_item'
                ) ]?: string;
            };
        }[];
    };
}

export interface TCommonsResponse {
    query: {
        pages: {
            imageinfo?: {
                url: string;
                descriptionurl: string;
                thumburl?: string;
                responsiveUrls?: Record< string, string >;
                extmetadata?: {
                    [ K in (
                        | 'Artist' | 'Attribution' | 'Credit' | 'DateTime'
                        | 'DateTimeOriginal' | 'ImageDescription'
                        | 'LicenseShortName' | 'UsageTerms'
                    ) ]?: { value?: string };
                };
            }[];
        }[];
    };
}
