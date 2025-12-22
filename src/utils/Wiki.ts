import { Fetch } from '@/core/Fetch';
import { TWikiData } from '@/types/generic';
import { TProfileData } from '@/types/profile';
import { TWikiDataResponse, TWikiDataResponseItem } from '@/types/response';
import { Parser } from '@/utils/Parser';

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
        if ( gender && item.gender?.value.endsWith( gender === 'm' ? 'Q6581097' : gender === 'f' ? 'Q6581072' : '-' ) ) score += 0.1;
        else if ( score && item.gender?.value ) score -= 0.2;

        // Citizenship matching
        if ( citizenship && item.iso2?.value === citizenship.toUpperCase() ) score += 0.2;

        // Media matching
        if ( item.article ) score += 0.1;
        if ( item.image ) score += 0.05;

        // Occupation matching
        if ( [ 'Q131524', 'Q557880', 'Q911554', 'Q2462658' ].some( e => item.occupation?.value.endsWith( e ) ) ) score += 0.2;
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

}
