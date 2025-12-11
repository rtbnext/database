import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
import { Response } from '@/types/response';
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
        url: string, method: 'get' | 'post' = 'get', retries: number = 0
    ) : Promise< Response< T > > {
        const { result: res, ms } = await Utils.measure( async () => {
            let res: AxiosResponse< T, any, {} >;
            do {
                const headers = { ...this.config.headers, 'User-Agent': this.getRandomUserAgent() };
                res = await this.httpClient[ method ]< T >( url, { headers } );
                if ( res.status === 200 && res.data ) break;
                await this.getRandomDelay();
            } while ( ++retries < this.config.rateLimit.retries );
            return res;
        } );

        return res.status === 200 && res.data ? {
            success: true, data: res.data, duration: ms, retries
        } : {
            success: false, error: `Invalid response status: ${ res.status }`,
            statusCode: res.status, duration: ms, retries
        };
    }

    public async single< T > ( url: string, method: 'get' | 'post' = 'get' ) : Promise< Response< T > > {
        return this.fetch< T >( url, method );
    }

    public async batch< T > ( urls: string[], method: 'get' | 'post' = 'get' ) : Promise< Response< T >[] > {
        const results: Response<T>[] = [];
        let url;

        while ( ( url = urls.shift() ) && results.length < this.config.rateLimit.maxBatchSize ) {
            results.push( await this.fetch< T >( url, method ) );
            await this.getRandomDelay();
        }

        return results;
    }

    public async profile ( ...uriLike: string[] ) : Promise< Response< T >[] > {}

    public async list ( uriLike: string, year: string ) : Promise< Response< T > > {}

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
