import * as Const from '@/utils/Const';
import { Logger } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { ProfileParser } from '@/utils/ProfileParser';
import { Utils } from '@/utils/Utils';
import { Wiki } from '@/utils/Wiki';

const helper = {
    log: Logger.getInstance(),
    parser: Parser,
    profileMerger: ProfileMerger,
    profileParser: ProfileParser,
    utils: Utils,
    wiki: Wiki
} as const;

export { Const, Logger, Parser, ProfileMerger, ProfileParser, Utils, Wiki };
export default helper;
