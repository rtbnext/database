import { ConfigLoader } from '@/core/ConfigLoader';
import { FetchConfig } from '@/types/config';
import axios, { AxiosInstance } from 'axios';

export class Fetch {

    private static instance: Fetch;
    private readonly config: FetchConfig;
    private httpClient: AxiosInstance;

    private constructor () {
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

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
