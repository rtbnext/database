export type Gender = ( typeof Gender )[ number ];
export const Gender = [ 'm', 'f', 'd' ] as const;

export type MaritalStatus = ( typeof MaritalStatus )[ number ];
export const MaritalStatus = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;
