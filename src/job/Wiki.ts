import { Job, jobRunner } from '@/abstract/Job';
import { IJob } from '@/interfaces/job';

export class WikiJob extends Job implements IJob {}

jobRunner( WikiJob );
