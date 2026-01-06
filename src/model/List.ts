import { Snapshot } from '@/abstract/Snapshot';
import { IList } from '@/interfaces/list';
import { TListSnapshot } from '@rtbnext/schema/src/model/list';

export class List extends Snapshot< TListSnapshot > implements IList {}
