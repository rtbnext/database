export class ConfigLoader {

    private static instance: ConfigLoader;

    private constructor () {}

    public get logging () { return ; }

    public static getInstance () : ConfigLoader {
        return ConfigLoader.instance ||= new ConfigLoader();
    }

}
