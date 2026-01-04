import { TListResponse, TProfileResponse, TResponse } from '@/types/response';

export interface IFetch {
    single< T > ( url: string, method: 'get' | 'post' = 'get' ) : Promise< TResponse< T > >;
    batch< T > ( urls: string[], method: 'get' | 'post' = 'get' ) : Promise< TResponse< T >[] >;
    wayback< T > ( url: string, ts: any ) : Promise< TResponse< T > >;
    list< T extends TListResponse > ( uriLike: string, year: string, ts?: any ) : Promise< TResponse< T > >;
    profile ( ...uriLike: string[] ) : Promise< TResponse< TProfileResponse >[] >;
    wikidata< T > ( sparql: string ) : Promise< TResponse< T > >;
    wikipedia< T > ( query: Record< string, any >, lang: string = 'en' ) : Promise< TResponse< T > >;
    commons< T > ( query: Record< string, any > ) : Promise< TResponse< T > >;
}
