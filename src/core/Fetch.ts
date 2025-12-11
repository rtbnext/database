import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
import { ListResponse, ProfileResponse, Response } from '@/types/response';
import { Utils } from '@/utils';
import { Logger } from '@/utils/Logger';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly logger: Logger;
    private readonly config: FetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.logger = Logger.getInstance();
        this.config = ConfigLoader.getInstance().fetch;
        this.httpClient = this.setupHttpClient();
    }

    private setupHttpClient () : AxiosInstance {
        const { baseUrl: baseURL, headers, rateLimit: { timeout } } = this.config;
        return axios.create( { baseURL, headers, timeout } );
    }

    private getRandomUserAgent () : string {
        return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];
    }

    private getRandomDelay () : Promise< void > {
        const { max, min } = this.config.rateLimit.requestDelay;
        const delay = Math.random() * ( max - min ) + min;
        return new Promise( resolve => setTimeout( resolve, delay ) );
    }

    private async fetch< T > (
        url: string, method: 'get' | 'post' = 'get'
    ) : Promise< Response< T > > {
        this.logger.info( `Fetching URL: ${url} via ${ method.toUpperCase() }` );
        const { result: res, ms } = await Utils.measure( async () => {
            let res: AxiosResponse< T, any, {} >;
            let retries = 0;
            do {
                const headers = { ...this.config.headers, 'User-Agent': this.getRandomUserAgent() };
                res = await this.httpClient[ method ]< T >( url, { headers } );
                if ( res.status === 200 && res.data ) break;
                this.logger.warn( `Request failed with status: ${ res.status }. Retrying ...` );
                await this.getRandomDelay();
            } while ( ++retries < this.config.rateLimit.retries );
            return { ...res, retries };
        } );

        this.logger.info( `Fetched URL: ${url} in ${ ms } ms` );
        return Object.assign( { duration: ms, retries: res.retries },
            res.status === 200 && res.data ? { success: true, data: res.data } : {
                success: false, error: `Invalid response status: ${ res.status }`,
                statusCode: res.status
            }
        );
    }

    public async single< T > ( url: string, method: 'get' | 'post' = 'get' ) : Promise< Response< T > > {
        return this.fetch< T >( url, method );
    }

    public async batch< T > ( urls: string[], method: 'get' | 'post' = 'get' ) : Promise< Response< T >[] > {
        const results: Response< T >[] = []; let url;
        while ( ( url = urls.shift() ) && results.length < this.config.rateLimit.maxBatchSize ) {
            results.push( await this.fetch< T >( url, method ) );
            await this.getRandomDelay();
        }
        if ( urls.length ) this.logger.warn( `Batch limit reached. ${ urls.length } URLs remaining.` );
        return results;
    }

    public async profile ( ...uriLike: string[] ) : Promise< Response< ProfileResponse >[] > {
        const url = this.config.endpoints.profile;
        return this.batch< ProfileResponse >( uriLike.map(
            uri => url.replace( '{URI}', Utils.sanitize( uri ) )
        ) );
    }

    public async list ( uriLike: string, year: string ) : Promise< Response< ListResponse > > {
        return this.single< ListResponse >( this.config.endpoints.list
            .replace( '{URI}', Utils.sanitize( uriLike ) )
            .replace( '{YEAR}', year )
        );
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
