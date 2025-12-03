import axios, { AxiosInstance } from 'axios';
import { Config, ConfigObject } from './Config';
import { Parser } from './Parser';
import { Storage } from './Storage';

export class Fetch {

    private static instance: Fetch;
    private readonly storage: Storage;
    private readonly parser: Parser;
    private readonly config: ConfigObject[ 'api' ];

    private httpClient!: AxiosInstance;
    private userAgentPool!: string[];

    protected constructor () {

        this.storage = Storage.getInstance();
        this.parser = Parser.getInstance();
        this.config = Config.getInstance().getAPIConfig();

        this.setupHttpClient();
        this.initializeUserAgentPool();

    }

    public static getInstance () : Fetch {

        if ( ! Fetch.instance ) Fetch.instance = new Fetch();
        return Fetch.instance;

    }

    private setupHttpClient () : void {

        this.httpClient = axios.create( {
            baseURL: this.config.baseUrl,
            timeout: this.config.rateLimiting.timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        } );

    }

    private initializeUserAgentPool () : void {

        this.userAgentPool = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

    }

    private getRandomUserAgent () : string {

        return this.userAgentPool[ Math.floor( Math.random() * this.userAgentPool.length ) ];

    }

    private getRandomDelay () : Promise< void > {

        const { max, min } = this.config.rateLimiting.requestDelay;
        const delay = Math.random() * ( max - min ) + min;
        return new Promise( resolve => setTimeout( resolve, delay ) );

    }

}
