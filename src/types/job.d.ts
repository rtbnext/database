import { IJob } from '@/interfaces/job';

export type TJobNames = 'move' | 'queue' | 'stats' | 'wiki';

export type TJobCtor = new ( ...args: any[] ) => IJob;

export type TJobs = Record< TJobNames, TJobCtor >;
