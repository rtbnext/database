import { Index } from '@/abstract/Index';

export class ProfileIndex extends Index< any > {

    protected static instance: ProfileIndex;

    private constructor () {
        super();
    }

    protected loadIndex () : any {
        return {};
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
