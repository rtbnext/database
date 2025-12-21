import { Fetch } from '@/core/Fetch';
import { TProfileData } from '@/types/profile';
import { TWikidataResponseItem, TWikidataResponse } from '@/types/response';
import { Gender } from '@/utils/Const';
import { Parser } from '@/utils/Parser';

export class Wiki {
    
    private static readonly fetch = Fetch.getInstance();

    private static scoreWDItem (
        item: TWikidataResponseItem, name: string, birth?: string, gender?: Gender
    ) : number {
        let score = 0;

        if ( item.itemLabel.value === name ) score += 0.4;
        else if ( item.itemLabel?.value ) score += 0.25;

        if ( birth && item.birthdate?.value.startsWith( birth ) ) score += 0.3;
        if ( gender ) score += 0.1;

        if ( item.article ) score += 0.1;
        if ( item.image ) score += 0.1;

        return score;
    }

    public static async queryWikiData ( data: Partial< TProfileData > ) : Promise< {
        qid: string, article?: string, image?: string, score: number
    } | false > {
        const { shortName, gender, birthDate } = data.info!;
        if ( ! shortName ) return false;

        const genderQ = gender === 'm' ? 'wd:Q6581097' : gender === 'f' ? 'wd:Q6581072' : undefined;
        const genderFilter = genderQ ? `?item wdt:P21 ${genderQ} .` : '';
        const birthDateFilter = birthDate
            ? `?item wdt:P569 ?birthdate . FILTER( STRSTARTS( STR(?birthdate), "${birthDate}" ) )`
            : `OPTIONAL { ?item wdt:P569 ?birthdate . }`;

        const sparql = `SELECT ?item ?itemLabel ?birthdate ?article ?image WHERE {` +
            `?item wdt:P31 wd:Q5 . {` +
                `{ ?item rdfs:label "${shortName}"@en . }` +
                `UNION { ?item skos:altLabel "${shortName}"@en . }` +
            `}` + genderFilter + birthDateFilter +
            `OPTIONAL { ?item wdt:P18 ?image . }` +
            `OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }` +
            `SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }` +
        `} LIMIT 10`;

        const res = await Wiki.fetch.wikidata< TWikidataResponse >( sparql );
        let best: { score: number, item: TWikidataResponseItem } | undefined;

        for ( const item of res.data?.results.bindings ?? [] ) {
            const score = Wiki.scoreWDItem( item, shortName, birthDate, gender );
            if ( ! best || score > best.score ) best = { score, item };
        }

        return ( ! best || best.score < 0.5 ) ? false : {
            qid: Parser.string( best.item.item.value.split( '/' ).pop()! ),
            article: Parser.strict( best.item.article?.value.split( '/' ).pop(), 'decodeURI' ),
            image: Parser.strict( best.item.image?.value.split( '/' ).pop(), 'decodeURI' ),
            score: best.score
        };
    }

}
