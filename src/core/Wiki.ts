import { Fetch } from '@/core/Fetch';
import { log } from '@/core/Logger';
import { Parser } from '@/parser/Parser';
import { TCommonsResponse, TWikipediaResponse } from '@/types/response';
import { TImage, TWiki } from '@rtbnext/schema/src/abstract/generic';

export class Wiki {

    private static readonly fetch = Fetch.getInstance();

    public static async queryCommonsImage ( title: string ) : Promise< TImage | undefined > {
        log.debug( `Querying Wikimedia Commons image: ${title}` );
        return await log.catchAsync( async () => {
            const res = await Wiki.fetch.commons< TCommonsResponse >( {
                action: 'query', titles: `File:${title}`, prop: 'imageinfo', redirects: 1,
                iiprop: 'url|extmetadata', iiurlwidth: 400
            } );

            const info = res.data?.query.pages?.[ 0 ]?.imageinfo?.[ 0 ];
            if ( ! info ) throw new Error( `No image info found for: ${title}` );

            log.debug( `Wikimedia Commons image info received for: ${title}` );
            const meta = info.extmetadata ?? {};
            const thumbUrl = info.thumburl ?? Object.values( info.responsiveUrls ?? {} ).at( 0 );
            const dateTime = meta.DateTimeOriginal?.value ?? meta.DateTime?.value;
            const credits = Parser.list( [
                meta.Attribution?.value || meta.Artist?.value || meta.Credit?.value,
                meta.LicenseShortName?.value || meta.UsageTerms?.value,
                'via Wikimedia Commons'
            ] ).join( ', ' );

            return Parser.container< TImage >( {
                url: { value: info.descriptionurl, type: 'string' },
                file: { value: info.url, type: 'string' },
                thumb: { value: thumbUrl, type: 'string' },
                caption: { value: meta.ImageDescription?.value, type: 'string' },
                date: { value: dateTime, type: 'date', args: [ 'iso' ] },
                credits: { value: credits, type: 'safeStr' }
            } );
        }, `Failed to query Wikimedia Commons image: ${title}` );
    }

    public static async queryWikiPage (
        title: string, qid?: string, image?: TImage, confidence: number = 1
    ) : Promise< TWiki | undefined > {
        log.debug( `Querying Wikipedia page: ${title}` );
        return await log.catchAsync( async () => {
            const res = await Wiki.fetch.wikipedia< TWikipediaResponse >( {
                action: 'query', prop: 'extracts|info|pageprops|pageimages',
                titles: title, redirects: 1, exintro: 1, explaintext: 1,
                exsectionformat: 'plain', piprop: 'name', pilimit: 1
            } );

            if ( ! res?.success || ! res.data || ! res.data.query.pages.length ) {
                throw new Error( `No Wikipedia page found for: ${title}` );
            }

            log.debug( `Wikipedia page info received for: ${title}` );
            const raw = res.data.query.pages[ 0 ];

            if ( ! image && raw.pageimage ) {
                log.debug( `Querying page image from Wikimedia Commons: ${raw.pageimage}` );
                image = await this.queryCommonsImage( raw.pageimage );
            }

            return { image, ...Parser.container< TWiki >( {
                uri: { value: title, type: 'string' },
                pageId: { value: raw.pageid, type: 'number' },
                refId: { value: raw.lastrevid, type: 'number' },
                confidence: { value: confidence, type: 'number', args: [ 3 ] },
                name: { value: raw.title, type: 'string' },
                lastModified: { value: raw.touched, type: 'date', args: [ 'iso' ] },
                summary: {
                    value: raw.extract ?? '', type: 'list',
                    args: [ 'safeStr', '\n' ], strict: false
                },
                sortKey: { value: raw.pageprops?.[ 'defaultsort' ], type: 'string' },
                wikidata: { value: qid ?? raw.pageprops?.[ 'wikibase_item' ], type: 'string' },
                desc: { value: raw.pageprops?.[ 'wikibase-shortdesc' ], type: 'safeStr' }
            } ) };
        }, `Failed to query Wikipedia page: ${title}` );
    }

}
