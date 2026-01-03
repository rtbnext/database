import { Config } from '@/core/Config';
import { TFetchConfig } from '@/types/config';
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

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
