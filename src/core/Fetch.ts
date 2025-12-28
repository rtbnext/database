import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { TFetchConfig } from '@/types/config';
import { TListResponse, TProfileResponse, TResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';
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
        return this.config.agentPool[ Math.floor( Math.random() * this.config.agentPool.length ) ];
    }

    private getRandomDelay () : Promise< void > {
        const { max, min } = this.config.rateLimit.requestDelay;
        const delay = Math.random() * ( max - min ) + min;
        return new Promise( resolve => setTimeout( resolve, delay ) );
    }

    private async fetch< T > (
        url: string, method: 'get' | 'post' = 'get'
    ) : Promise< TResponse< T > > {
        log.debug( `Fetching URL: ${url} via ${ method.toUpperCase() }` );

        const { result: res, ms } = await Utils.measure( async () => {
            let res: AxiosResponse< T, any, {} >;
            let retries = 0;
            do {
                const headers = { ...this.config.headers, 'User-Agent': this.getRandomUserAgent() };
                res = await this.httpClient[ method ]< T >( url, { headers } );
                if ( res.status === 200 && res.data ) break;
                log.warn( `Request failed with status: ${ res.status }. Retrying ...` );
                await this.getRandomDelay();
            } while ( ++retries < this.config.rateLimit.retries );
            return { ...res, retries };
        } );

        log.debug( `Fetched URL: ${url} in ${ ms } ms` );
        return Object.assign( { duration: ms, retries: res.retries },
            res.status === 200 && res.data ? { success: true, data: res.data } : {
                success: false, error: `Invalid response status: ${ res.status }`,
                statusCode: res.status
            }
        );
    }

    public async single< T > ( url: string, method: 'get' | 'post' = 'get' ) : Promise< TResponse< T > > {
        return this.fetch< T >( url, method );
    }

    public async batch< T > ( urls: string[], method: 'get' | 'post' = 'get' ) : Promise< TResponse< T >[] > {
        const results: TResponse< T >[] = []; let url;

        while ( ( url = urls.shift() ) && results.length < this.config.rateLimit.maxBatchSize ) {
            results.push( await this.fetch< T >( url, method ) );
            await this.getRandomDelay();
        }

        if ( urls.length ) log.warn( `Batch limit reached. ${ urls.length } URLs remaining.` );
        return results;
    }

    public async wayback< T > ( url: string, ts: any ) : Promise< TResponse< T > > {
        const timestamp = Parser.date( ts, 'ymd' )!.replaceAll( /[^\d]/g, '' );
        const res = await this.single< { archived_snapshots: {
            closest?: { status: string, available: boolean, url: string, timestamp: string }
        } } >( this.config.endpoints.wbTest
            .replace( '{URL}', encodeURIComponent( url ) )
            .replace( '{TS}', timestamp )
        );

        if ( ! res?.success || ! res.data?.archived_snapshots?.closest?.available ) return {
            success: false, error: 'No archived snapshot found',
            duration: res.duration, retries: res.retries
        };

        const snapshotUrl = res.data.archived_snapshots.closest.url;
        return this.single< T >( this.config.endpoints.wayback.replace( '{URL}', snapshotUrl ) );
    }

    public async list< T extends TListResponse > (
        uriLike: string, year: string, ts?: any
    ) : Promise< TResponse< T > > {
        const url: string = this.config.endpoints.list
            .replace( '{URI}', Utils.sanitize( uriLike ) )
            .replace( '{YEAR}', year );

        return ts ? this.wayback< T >( url, ts ) : this.single< T >( url );
    }

    public async profile ( ...uriLike: string[] ) : Promise< TResponse< TProfileResponse >[] > {
        const url = this.config.endpoints.profile;
        return this.batch< TProfileResponse >( uriLike.map(
            uri => url.replace( '{URI}', Utils.sanitize( uri ) )
        ) );
    }

    public async wikipedia< T > ( query: Record< string, any >, lang: string = 'en' ) : Promise< TResponse< T > > {
        return this.single< T >( this.config.endpoints.wikipedia
            .replace( '{QUERY}', Utils.queryStr( { ...{ format: 'json', formatversion: 2 }, ...query } ) )
            .replace( '{LANG}', lang )
        );
    }

    public async wikidata< T > ( sparql: string ) : Promise< TResponse< T > > {
        return this.single< T >( this.config.endpoints.wikidata.replace( '{SPARQL}',
            encodeURIComponent( sparql.replace( /\s+/g, ' ' ).trim() )
        ) );
    }

    public async commons< T > ( query: Record< string, any > ) : Promise< TResponse< T > > {
        return this.single< T >( this.config.endpoints.commons
            .replace( '{QUERY}', Utils.queryStr( { ...{ format: 'json', formatversion: 2 }, ...query } ) )
        );
    }

    public static getInstance () {
        return Fetch.instance ||= new Fetch();
    }

}
