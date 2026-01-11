import { Fetch } from '@/core/Fetch';
import { log } from '@/core/Logger';
import { Parser } from '@/parser/Parser';
import * as R from '@/types/response';
import { TImage, TWiki, TWikidata } from '@rtbnext/schema/src/abstract/generic';
import { TProfileData } from '@rtbnext/schema/src/model/profile';

export class Wiki {

    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem (
        item: R.TWikidataResponseItem, data: Partial< TProfileData >
    ) : number {
        const { shortName, gender, birthDate, citizenship } = data.info ?? {};
        let score = 0;

        // Name matching
        if ( item.itemLabel.value.trim() === shortName ) score += 0.2;
        else if ( item.itemLabel.xmlLang === 'en' ) score += 0.1;
        else score += 0.1;

        // Birthdate matching
        if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.2;
        else if ( birthDate && item.birthdate?.value.startsWith(
            birthDate.substring( 0, 4 )
        ) ) score += 0.1;
        else if ( birthDate && item.birthdate?.value ) score -= 0.1;

        // Gender matching
        if ( gender && item.gender?.value.endsWith(
            gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-'
        ) ) score += 0.1;
        else if ( score && item.gender?.value ) score -= 0.2;

        // Citizenship matching
        if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.2;

        // Media matching
        if ( item.article ) score += 0.1;
        if ( item.image ) score += 0.05;

        // Occupation matching
        if ( [ 'Q131524', 'Q557880', 'Q911554', 'Q2462658' ].some(
            e => item.occupation?.value.endsWith( e )
        ) ) score += 0.2;
        else if ( item.occupation ) score += 0.05;

        // Economic matching
        if ( item.employer || item.ownerOf ) score += 0.1;
        if ( item.netWorth ) score += 0.2;

        return Math.min( 1, Math.max( 0, score ) );
    }

    public static async queryWikidata (
        data: Partial< TProfileData >
    ) : Promise< TWikidata | undefined > {
        const shortName = data.info?.shortName;
        if ( ! shortName ) return;

        const [ first, ...rest ] = shortName.split( ' ' ); const last = rest.pop();
        const nameVariants = [ shortName, `${first[ 0 ]}. ${last}`, `${first} ${last}` ]
            .filter( Boolean ).map( n => `"${n}"@en "${n}"@de` ).join( ' ' );

        const sparql = `
            SELECT DISTINCT
                ?item ?itemLabel ?gender ?birthdate ?article ?image ?iso2
                ?occupation ?employer ?ownerOf ?netWorth
            WHERE {
                VALUES ?name { ${nameVariants} }
                ?item wdt:P31 wd:Q5 .
                { { ?item rdfs:label ?name . } UNION { ?item skos:altLabel ?name . } }
                OPTIONAL { ?item wdt:P21 ?gender . }
                OPTIONAL { ?item wdt:P569 ?birthdate . }
                OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
                OPTIONAL { ?item wdt:P18 ?image . }
                OPTIONAL { ?item wdt:P27 ?country . ?country wdt:P297 ?iso2 . }
                OPTIONAL { ?item wdt:P106 ?occupation . }
                OPTIONAL { ?item wdt:P108 ?employer . }
                OPTIONAL { ?item wdt:P169 ?employer . }
                OPTIONAL { ?item wdt:P127 ?ownerOf . }
                OPTIONAL { ?item wdt:P1830 ?ownerOf . }
                OPTIONAL { ?item wdt:P2218 ?netWorth . }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de" . }
            }
            LIMIT 20
        `;

        const res = await Wiki.fetch.wikidata< R.TWikidataResponse >( sparql );
        let best: { score: number, item: R.TWikidataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, data );
            if ( ! best || score > best.score ) best = { score, item };
            if ( best.score === 1 ) break;
        }

        if ( best && best.score >= 0.65 ) return Parser.container< TWikidata >( {
            qid: { value: best.item.item.value.split( '/' ).pop()!, type: 'string' },
            article: { value: best.item.article?.value.split( '/' ).pop(), type: 'decodeURI' },
            image: { value: best.item.image?.value.split( '/' ).pop(), type: 'decodeURI' },
            score: { value: best.score, type: 'number', args: [ 1 ] }
        } );
    }

    public static async queryCommonsImage ( title: string ) : Promise< TImage | undefined > {
        log.debug( `Querying Wikimedia Commons image: ${title}` );
        return await log.catchAsync( async () => {
            const res = await Wiki.fetch.commons< R.TCommonsResponse >( {
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
            const res = await Wiki.fetch.wikipedia< R.TWikipediaResponse >( {
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
