import * as Const from '@/utils/Const';
import { Logger } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';
import { Utils } from '@/utils/Utils';

const helper = {
    log: Logger.getInstance(),
    parser: Parser,
    utils: Utils
} as const;

export { Const, Logger, Parser, Utils };
export default helper;
