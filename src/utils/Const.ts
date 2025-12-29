export type Gender = ( typeof Gender )[ number ];
export const Gender = [ 'm', 'f', 'd' ] as const;

export type MaritalStatus = ( typeof MaritalStatus )[ number ];
export const MaritalStatus = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;

export type MaritalStatusResolver = Record< string, MaritalStatus >;
export const MaritalStatusResolver = {
    'single': 'single',
    'in-relationship': 'relationship',
    'married': 'married',
    'remarried': 'remarried',
    'engaged': 'engaged',
    'separated': 'separated',
    'divorced': 'divorced',
    'widowed': 'widowed'
} as const;

export type Industry = ( typeof Industry )[ number ];
export const Industry = [
    'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff',
    'gambling', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as const;

export type IndustryResolver = Record< string, Industry >;
export const IndustryResolver = {
    'technology': 'technology',
    'fashion-retail': 'retail',
    'finance-investments': 'finance',
    'diversified': 'diversified',
    'telecom': 'telecom',
    'energy': 'energy',
    'metals-mining': 'mining',
    'gambling-casinos': 'gambling',
    'healthcare': 'healthcare',
    'manufacturing': 'manufacturing',
    'logistics': 'logistics',
    'automotive': 'automotive',
    'media-entertainment': 'media',
    'construction-engineering': 'engineering',
    'sports': 'sports',
    'real-estate': 'property',
    'service': 'service'
} as const;

export type Relationship = ( typeof Relationship )[ number ];
export const Relationship = [ 'person', 'organization', 'place' ] as const;

export type Flag = ( typeof Flag )[ number ];
export const Flag = [ 'up', 'down', 'unchanged' ] as const;

export type AssetType = ( typeof AssetType )[ number ];
export const AssetType = [ 'private', 'public', 'unknown' ] as const;

export const QueueType = [ 'profile', 'list' ] as const;
export type QueueType = ( typeof QueueType )[ number ];

export type FilterGroup = ( typeof FilterGroup )[ number ];
export const FilterGroup = [
    'industry', 'citizenship', 'country', 'state', 'gender', 'age',
    'maritalStatus', 'special'
] as const;

export type FilterSpecial = ( typeof FilterSpecial )[ number ];
export const FilterSpecial = [ 'deceased', 'dropOff', 'family', 'selfMade:' ] as const;
