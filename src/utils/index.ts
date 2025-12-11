import { Base } from './Base';
import { ConfigLoader } from './ConfigLoader';
import * as Const from './Const';
import { Logger } from './Logger';
import { Parser } from './Parser';

const Utils = {
    const: Const, base: Base, config: ConfigLoader,
    logger: Logger, parser: Parser
};

export default Utils;
export { Const, Base, ConfigLoader, Logger, Parser };
