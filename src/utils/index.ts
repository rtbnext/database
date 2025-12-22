import * as Const from '@/utils/Const';
import { log, Logger } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';
import { ProfileMerger } from '@/utils/ProfileMerger';
import { ProfileParser } from '@/utils/ProfileParser';
import { Utils } from '@/utils/Utils';

const helper = {
    log,
    parser: Parser,
    profileMerger: ProfileMerger,
    profileParser: ProfileParser,
    utils: Utils
} as const;

export { Const, Logger, Parser, ProfileMerger, ProfileParser, Utils };
export default helper;
