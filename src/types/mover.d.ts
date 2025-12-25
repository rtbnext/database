export interface TMoverEntry {
    readonly uri: string;
    name: string;
    value: number;
}

export interface TMoverSubject {
    winner: MoverEntry[];
    loser: MoverEntry[];
}

export interface TMover {
    date: string;
    networth: TMoverSubject;
    percent: TMoverSubject;
}
