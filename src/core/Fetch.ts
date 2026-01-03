import { Config } from '@/core/Config';
import { Utils } from '@/core/Utils';
import { TFetchConfig } from '@/types/config';
import { TResponse } from '@/types/response';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly config: TFetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
        this.config = Config.getInstance().fetch;
        this.httpClient = this.setupHttpClient();
    }

    private setupHttpClient () : AxiosInstance {
        const { headers, rateLimit: { timeout } } = this.config;
        return axios.create( { headers, timeout } );
    }

    private getRandomUserAgent () : string {
        return this.config.agentPool[ Math.floor(
            Math.random() * this.config.agentPool.length
        ) ];
    }

    private getRandomDelay () : Promise< void > {
        const { max, min } = this.config.rateLimit.requestDelay;
        const delay = Math.round( Math.random() * ( max - min ) + min );
        return new Promise( resolve => setTimeout( resolve, delay ) );
    }

    private async fetch< T > (
        url: string, method: 'get' | 'post' = 'get'
    ) : Promise< TResponse< T > > {
        const { result: res, ms } = await Utils.measure( async () => {
            let res: AxiosResponse< T, any, {} >;
            let retries = 0;

            do {
                const headers = {
                    ...this.config.headers,
                    'User-Agent': this.getRandomUserAgent()
                };

                res = await this.httpClient[ method ]< T >( url, { headers } );
                if ( res.status === 200 && res.data ) break;

                await this.getRandomDelay();
            } while ( ++retries < this.config.rateLimit.retries );

            return { ...res, retries };
        } );

        return Object.assign( { duration: ms, retries: res.retries },
            res.status === 200 && res.data ? { success: true, data: res.data } : {
                success: false, error: `Invalid response status: ${ res.status }`,
                statusCode: res.status
            }
        );
    }

    public async single< T > (
        url: string, method: 'get' | 'post' = 'get'
    ) : Promise< TResponse< T > > {
        return this.fetch< T >( url, method );
    }

    public async batch< T > (
        urls: string[], method: 'get' | 'post' = 'get'
    ) : Promise< TResponse< T >[] > {
        const results: TResponse< T >[] = []; let url;

        while ( ( url = urls.shift() ) && results.length < this.config.rateLimit.batchSize ) {
            results.push( await this.fetch< T >( url, method ) );
            await this.getRandomDelay();
        }

        if ( urls.length ) console.warn( `Batch limit reached. ${ urls.length } URLs remaining.` );
        return results;
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
