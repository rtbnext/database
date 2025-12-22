import { Fetch } from '@/core/Fetch';
import { TImage, TWiki, TWikiData } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TCommonsResponse, TWikiDataResponse, TWikiDataResponseItem, TWikipediaResponse } from '@/types/response';
import helper, { Parser } from '@/utils';

export class Wiki {
    
    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem ( item: TWikiDataResponseItem, data: Partial< TProfileData > ) : number {
        const { shortName, gender, birthDate, citizenship } = data.info ?? {};
        let score = 0;

        // Name matching
        if ( item.itemLabel.value.trim() === shortName ) score += 0.2;
        else if ( item.itemLabel.xmlLang === 'en' ) score += 0.1;
        else score += 0.1;

        // Birthdate matching
        if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.2;
        else if ( birthDate && item.birthdate?.value.startsWith( birthDate.substring( 0, 4 ) ) ) score += 0.1;
        else if ( birthDate && item.birthdate?.value ) score -= 0.1;

        // Gender matching
        if ( gender && item.gender?.value.endsWith(
            gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-'
        ) ) score += 0.1;

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

    public static async queryWikiData ( data: Partial< TProfileData > ) : Promise< TWikiData | undefined > {
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

        const res = await Wiki.fetch.wikidata< TWikiDataResponse >( sparql );
        let best: { score: number, item: TWikiDataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, data );
            if ( ! best || score > best.score ) best = { score, item };
        }

        if ( best && best.score >= 0.65 ) return Parser.container< TWikiData >( {
            qid: { value: best.item.item.value.split( '/' ).pop()!, method: 'string' },
            article: { value: best.item.article?.value.split( '/' ).pop(), method: 'decodeURI' },
            image: { value: best.item.image?.value.split( '/' ).pop(), method: 'decodeURI' },
            score: { value: best.score, method: 'number', args: [ 1 ] }
        } );
    }

    public static async queryWikiPage ( title: string, qid?: string ) : Promise< TWiki | undefined > {
        const res = await Wiki.fetch.wikipedia< TWikipediaResponse >( {
            action: 'query', prop: 'extracts|info|pageprops', titles: title, redirects: 1,
            exintro: 1, explaintext: 1, exsectionformat: 'plain'
        } );

        if ( ! res?.success || ! res.data || ! res.data.query.pages.length ) return;
        const raw = res.data.query.pages[ 0 ];

        return Parser.container< TWiki >( {
            uri: { value: title, method: 'string' },
            pageId: { value: raw.pageid, method: 'number' },
            refId: { value: raw.lastrevid, method: 'number' },
            name: { value: raw.title, method: 'string' },
            lastModified: { value: raw.touched, method: 'date', args: [ 'iso' ] },
            summary: { value: raw.extract ?? '', method: 'list', args: [ '\n' ], strict: false },
            sortKey: { value: raw.pageprops?.defaultsort, method: 'string' },
            wikidata: { value: qid ?? raw.pageprops?.[ 'wikibase_item' ], method: 'string' },
            desc: { value: raw.pageprops?.[ 'wikibase-shortdesc' ], method: 'cleanStr' }
        } );
    }

    public static async queryCommonsImage ( title: string ) : Promise< TImage | undefined > {
        const res = await Wiki.fetch.commons< TCommonsResponse >( {
            action: 'query', titles: `File:${title}`, prop: 'imageinfo', redirects: 1,
            iiprop: 'url|extmetadata', iiurlwidth: 400
        } );

        const info = res.data?.query.pages?.[ 0 ]?.imageinfo?.[ 0 ];
        if ( ! info ) return;

        const meta = info.extmetadata ?? {};
        const thumbUrl = info.thumburl ?? Object.values( info.responsiveUrls ?? {} )[ 0 ];
        const dateTime = meta.DateTimeOriginal?.value ?? meta.DateTime?.value;
        const credits = Parser.list( [
            meta.Attribution?.value || meta.Artist?.value || meta.Credit?.value,
            meta.LicenseShortName?.value || meta.UsageTerms?.value,
            'via Wikimedia Commons'
        ] ).join( ', ' );

        return Parser.container< TImage >( {
            url: { value: info.descriptionurl, method: 'string' },
            file: { value: info.url, method: 'string' },
            thumb: { value: thumbUrl, method: 'string' },
            caption: { value: meta.ImageDescription?.value, method: 'string' },
            date: { value: dateTime, method: 'date', args: [ 'iso' ] },
            credits: { value: credits, method: 'cleanStr' }
        } );
    }

    public static async queryWikiImage ( pageTitle: string ) : Promise< TImage | undefined > {
        const res = await Wiki.fetch.wikipedia< { query: { pages: { pageimage?: string }[] } } >( {
            action: 'query', prop: 'pageimages', titles: pageTitle, redirects: 1, pilimit: 1
        } );

        const image = res.data?.query.pages?.[ 0 ]?.pageimage;
        return image ? await this.queryCommonsImage( image ) : undefined;
    }

    public static async profile ( data: Partial< TProfileData > ) : Promise< TWiki | undefined > {
        const { qid, article, image, score } = await Wiki.queryWikiData( data ) ?? {};
        helper.log.debug( `Query WikiData for ${ data.info?.shortName }: ${ qid || 'no match' } (score: ${ score || 0 })` );

        const articleData = article ? await this.queryWikiPage( article, qid ) : undefined;
        const imageData = image ? await this.queryCommonsImage( image )
            : article ? await this.queryWikiImage( article ) : undefined;

        if ( articleData ) return { ...articleData, image: imageData };
    }

}
