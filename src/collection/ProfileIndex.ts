import { Index } from '@/abstract/Index';

export class ProfileIndex extends Index {

    protected static instance: ProfileIndex;

    private constructor () {
        super();
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
