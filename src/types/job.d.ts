import { IJob } from '@/interfaces/job';

export type TJobNames = 'list' | 'merge' | 'move' | 'profile' | 'queue' | 'rtb' | 'stats' | 'wiki';

export type TJobCtor = new ( ...args: any[] ) => IJob;

export type TJobs = Record< TJobNames, TJobCtor >;
