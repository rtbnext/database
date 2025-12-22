import { UpdateProfile } from '@/job/UpdateProfile';
import { UpdateWiki } from './job/UpdateWiki';

export const jobs = { UpdateProfile, UpdateWiki } as const;

export * from '@/collection';
export * from '@/core';
export * from '@/utils';
