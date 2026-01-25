import { Profile } from '@/model/Profile';

export type TProfileOperation = 'create' | 'update' | 'merge';

export interface TProfileLookupResult {
    profile: Profile | false;
    isExisting: boolean;
    isSimilar: boolean;
}
