import { Profile } from '@/model/Profile';

export interface TProfileOperation {
    profile: Profile | null;
    isExisting: boolean;
    isSimilar: boolean;
    action: 'create' | 'update' | 'merge';
}

export interface TProfileLookupResult {
    profile: Profile | null;
    isExisting: boolean;
    isSimilar: boolean;
}
