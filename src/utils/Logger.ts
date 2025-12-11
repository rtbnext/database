import { ConfigLoader } from './ConfigLoader';

export class Logger {

    private static instance: Logger;
    private readonly config;

    private constructor () {
        this.config = ConfigLoader.getInstance().logging;
    }

    private format () {}

    private log () {}

    public error () {}

    public exit () {}

    public warn () {}

    public info () {}

    public debug () {}

    public static getInstance () : Logger {
        return Logger.instance ||= new Logger();
    }

}
