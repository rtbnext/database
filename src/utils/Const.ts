export type Gender = ( typeof Gender )[ number ];
export const Gender = [ 'm', 'f', 'd' ] as const;

export type MaritalStatus = ( typeof MaritalStatus )[ number ];
export const MaritalStatus = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;

export type Industry = ( typeof Industry )[ number ];
export const Industry = [
    'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff',
    'gambling', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as const;
