export type TArgs = Record< string, string | boolean >;

export type TAggregator =
    | 'all' | 'first' | 'last' | 'sum' | 'min' | 'max' | 'mean'
    | ( ( values: readonly T[ K ][] ) => R );
