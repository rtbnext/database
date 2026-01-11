import { Fetch } from '@/core/Fetch';
import { log } from '@/core/Logger';
import { Parser } from '@/parser/Parser';
import { TCommonsResponse } from '@/types/response';
import { TImage } from '@rtbnext/schema/src/abstract/generic';

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

}
