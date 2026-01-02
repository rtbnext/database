import { TIndustryResolver, TMaritalStatusResolver } from '@/types/generic';
import { TGender, TIndustry, TMaritalStatus } from '@rtbnext/schema/src/abstract/const';

export const Gender: TGender[] = [ 'm', 'f', 'd' ] as const;

export const MaritalStatus: TMaritalStatus[] = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;

export const Industry: TIndustry[] = [
    'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff',
    'gambling', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as const;

export const MaritalStatusResolver: TMaritalStatusResolver = {
    'single': 'single',
    'in-relationship': 'relationship',
    'married': 'married',
    'remarried': 'remarried',
    'engaged': 'engaged',
    'separated': 'separated',
    'divorced': 'divorced',
    'widowed': 'widowed'
} as const;

export const IndustryResolver: TIndustryResolver = {
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
