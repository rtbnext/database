import * as Const from '@rtbnext/schema/src/abstract/const';

import { TIndustryResolver, TMaritalStatusResolver } from '@/types/generic';

// Basics

export const Gender: Const.TGender[] = [
    'm', 'f', 'd'
] as const;

export const MaritalStatus: Const.TMaritalStatus[] = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;

export const Industry: Const.TIndustry[] = [
    'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff',
    'gambling', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as const;

export const ChangeFlag: Const.TChangeFlag[] = [
    'up', 'down', 'unchanged'
] as const;

export const RelationType: Const.TRelationType[] = [
    'person', 'organization', 'place', 'unknown'
] as const;

export const AssetType: Const.TAssetType[] = [
    'public', 'private', 'misc'
] as const;

// Filter

export const FilterGroup: Const.TFilterGroup[] = [
    'industry', 'citizenship', 'country', 'state',
    'gender', 'age', 'maritalStatus', 'special'
] as const;

export const FilterSpecial: Const.TFilterSpecial[] = [
    'deceased', 'dropOff', 'family', 'selfMade'
] as const;

// Stats

export const StatsGroup: Const.TStatsGroup[] = [
    'industry', 'citizenship'
] as const;

export const ChildrenGroup: Const.TChildrenGroup[] = [
    'none', 'one', 'two', 'three', 'four', '5-to-10', 'over-10'
] as const;

export const Percentiles: Const.TPercentiles[] = [
    '10th', '25th', '50th', '75th', '90th', '95th', '99th'
] as const;

export const WealthSpread: Const.TWealthSpread[] = [
    '1', '2', '5', '10', '20', '50', '100', '200', '500'
] as const;

// Resolver

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
