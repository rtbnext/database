import { Fetch } from '@/core/Fetch';
import { TImage, TWiki, TWikiData } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TCommonsResponse, TWikiDataResponse, TWikiDataResponseItem, TWikipediaResponse } from '@/types/response';
import { Parser } from '@/utils/Parser';

export class Wiki {
    
    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem ( item: TWikiDataResponseItem, data: Partial< TProfileData > ) : number {
        const { shortName, birthDate, citizenship } = data.info!;
        let score = 0;

        if ( item.itemLabel.value.trim() === shortName ) score += 0.3;
        else if ( item.itemLabel.xmlLang === 'en' ) score += 0.2;
        else score += 0.10;

        if ( birthDate && item.birthdate?.value.startsWith( birthDate ) ) score += 0.3;
        if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.2;

        if ( item.article ) score += 0.1;
        if ( item.image ) score += 0.05;

        if ( item.occupation ) score += 0.05;
        if ( item.employer || item.ownerOf ) score += 0.1;
        if ( item.netWorth ) score += 0.2;

        return Math.min( 1, Math.max( 0, score ) );
    }

    public static async queryWikiData ( data: Partial< TProfileData > ) : Promise< TWikiData | false > {
        const { shortName, gender, birthDate } = data.info!;
        if ( ! shortName ) return false;

        const genderQ = gender === 'm' ? 'wd:Q6581097' : gender === 'f' ? 'wd:Q6581072' : undefined;
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
                ${ genderQ ? `?item wdt:P21 ?gender . FILTER( ?gender = ${genderQ} )` : '' }
                ${ birthDate
                    ? `?item wdt:P569 ?birthdate . FILTER( STRSTARTS( STR(?birthdate), "${birthDate}" ) )`
                    : `OPTIONAL { ?item wdt:P569 ?birthdate . }`
                }
                OPTIONAL { ?item wdt:P18 ?image . }
                OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
                OPTIONAL { ?item wdt:P27 ?country . ?country wdt:P297 ?iso2 . }
                OPTIONAL { ?item wdt:P106 ?occupation . }
                OPTIONAL { ?item wdt:P108 ?employer . }
                OPTIONAL { ?item wdt:P169 ?employer . }
                OPTIONAL { ?item wdt:P127 ?ownerOf . }
                OPTIONAL { ?item wdt:P2218 ?netWorth . }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de" . }
            }
            LIMIT 10
        `;

        const res = await Wiki.fetch.wikidata< TWikiDataResponse >( sparql );
        let best: { score: number, item: TWikiDataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, data );
            if ( ! best || score > best.score ) best = { score, item };
        }

        return ( ! best || best.score < 0.65 ) ? false : Parser.container< TWikiData >( {
            qid: { value: best.item.item.value.split( '/' ).pop()!, method: 'string' },
            article: { value: best.item.article?.value.split( '/' ).pop(), method: 'decodeURI' },
            image: { value: best.item.image?.value.split( '/' ).pop(), method: 'decodeURI' },
            score: { value: best.score, method: 'number', args: [ 1 ] }
        } );
    }

    public static async queryWikiPage ( title: string, qid?: string ) : Promise< TWiki | false > {
        const res = await Wiki.fetch.wikipedia< TWikipediaResponse >( {
            action: 'query', prop: 'extracts|info|pageprops', titles: title, redirects: 1,
            exintro: 1, explaintext: 1, exsectionformat: 'plain'
        } );

        if ( ! res?.success || ! res.data || ! res.data.query.pages.length ) return false;
        const raw = res.data.query.pages[ 0 ];

        return Parser.container< TWiki >( {
            uri: { value: title, method: 'string' },
            pageId: { value: raw.pageid, method: 'number' },
            refId: { value: raw.lastrevid, method: 'number' },
            name: { value: raw.title, method: 'string' },
            lastModified: { value: raw.touched, method: 'date', args: [ 'iso' ] },
            summary: { value: raw.extract ?? '', method: 'list', args: [ '\n' ], strict: false },
            sortKey: { value: raw.pageprops?.defaultsort, method: 'string' },
            wikidata: { value: qid, method: 'string' },
            desc: { value: raw.pageprops?.[ 'wikibase-shortdesc' ], method: 'string' }
        } );
    }

    public static async queryCommonsImage ( title: string ) : Promise< TImage | false > {
        const res = await Wiki.fetch.commons< TCommonsResponse >( {
            action: 'query', titles: `File:${title}`, prop: 'imageinfo', redirects: 1,
            iiprop: 'url|extmetadata', iiurlwidth: 400
        } );

        const info = res.data?.query.pages?.[ 0 ]?.imageinfo?.[ 0 ];
        if ( ! info ) return false;

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

}
