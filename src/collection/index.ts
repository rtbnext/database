import { List } from './List';
import { ListIndex } from './ListIndex';
import { Profile } from './Profile';
import { ProfileIndex } from './ProfileIndex';

export const index = {
    profileIndex: ProfileIndex.getInstance,
    listIndex: ListIndex.getInstance
};

export { List, ListIndex, Profile, ProfileIndex };
