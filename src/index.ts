import { MoveProfile } from '@/job/MoveProfile';
import { UpdateProfile } from '@/job/UpdateProfile';
import { UpdateWiki } from '@/job/UpdateWiki';

export const jobs = {
    MoveProfile, UpdateProfile, UpdateWiki
} as const;

export * from '@/collection';
export * from '@/core';
export * from '@/utils';
