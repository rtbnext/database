import { List } from '@/collection/List';
import { ListIndex } from '@/collection/ListIndex';
import { Profile } from '@/collection/Profile';
import { ProfileIndex } from '@/collection/ProfileIndex';

export const index = {
    profileIndex: ProfileIndex.getInstance,
    listIndex: ListIndex.getInstance
} as const;

export { List, ListIndex, Profile, ProfileIndex };
