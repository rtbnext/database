import axios, { AxiosInstance } from 'axios';
import { Config, ConfigObject } from './Config';

export interface Response< T > {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    duration: [ number, number ];
}

export class Fetch {

    private static instance: Fetch;
    private readonly config: ConfigObject[ 'api' ];
    private httpClient!: AxiosInstance;

    protected constructor () {

        this.config = Config.getInstance().getAPIConfig();
        this.setupHttpClient();

    }

    public static getInstance () : Fetch {

        if ( ! Fetch.instance ) Fetch.instance = new Fetch();
        return Fetch.instance;

    }

    private setupHttpClient () : void {

        this.httpClient = axios.create( {
            baseURL: this.config.baseUrl,
            timeout: this.config.rateLimiting.timeout,
            headers: { ...this.config.headers }
        } );

    }

    private getRandomUserAgent () : string {

        return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];

    }

    private getRandomDelay () : Promise< void > {

        const { max, min } = this.config.rateLimiting.requestDelay;
        const delay = Math.random() * ( max - min ) + min;
        return new Promise( resolve => setTimeout( resolve, delay ) );

    }

    public async request< T > ( target: string, retries: number = 0 ) : Promise< Response< T > > {

        const startTime = process.hrtime();

        try {

            const userAgent = this.getRandomUserAgent();
            const headers = { ...this.config.headers, 'User-Agent': userAgent };
            const res = await this.httpClient.get< T >( target, { headers } );
            const duration = process.hrtime( startTime );

            if ( res.status === 200 && res.data ) return { success: true, data: res.data, statusCode: res.status, duration };
            return { success: false, error: `Invalid response status: ${ res.status }`, statusCode: res.status, duration };

        } catch ( err: any ) {

            console.warn( `Request failed: ${err.message}`, `URL: ${target}, Attempt: ${ retries + 1 }`);

            if ( retries < this.config.rateLimiting.retries ) {

                console.debug( `Retrying ...` );
                await this.getRandomDelay();

                return this.request< T >( target, retries + 1 );

            }

            throw err;

        }

    }

    public async requestMultiple< T > ( targets: string[] ) : Promise< Response< T >[] > {

        const results = [];
        let target, count = 0;

        while ( target = targets.shift() && target && count < this.config.rateLimiting.batch ) {

            results.push( await this.request< T >( target ) );
            count++;

            await this.getRandomDelay();

        }

        if ( targets.length ) console.warn( `Batch limit reached. ${ targets.length } requests remaining.` );

        return results;

    }

}
