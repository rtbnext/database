import { TListStats } from '@/types/list';
import { Gender, MaritalStatus } from '@/utils/Const';

export type TGlobalStats = TListStats & {
    agePyramid: Record< Gender, Record< number, number > >;
    maritalStatus: { [ K in MaritalStatus ]?: number };
    children: Record< number, number >;
};

export type TStatsHistory = TStatsHistoryItem[];

export type TStatsHistoryItem = [ string, number, number, number, number, number, number ];

export type TReturnHistory = TReturnHistoryItem[];

export type TReturnHistoryItem = [ string, number, number, number, number, number, number ];

export interface TReturnCollection {
    industry: Record< string, TReturnHistory >;
    citizenship: Record< string, TReturnHistory >;
    country: Record< string, TReturnHistory >;
}
