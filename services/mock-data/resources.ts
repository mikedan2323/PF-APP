import { Resource } from '../../types';

export const MOCK_RESOURCE_CATEGORIES: string[] = [
    'Official Resources', 'Skills', 'Craft Ideas', 'Leadership'
];

export const MOCK_RESOURCES: Resource[] = [
    { id: 'res1', name: 'Pathfinder Online Wiki', url: 'https://pathfinderwiki.org', category: 'Official Resources', by: 'Director', at: '2024-01-15' },
    { id: 'res2', name: 'NAD Youth Ministries', url: 'https://www.nadadventistyouth.org/', category: 'Official Resources', by: 'Director', at: '2024-01-15' },
    { id: 'res3', name: 'Knot Tying Guide', url: 'https://www.animatedknots.com/', category: 'Skills', by: 'Leader', at: '2024-03-20' },
];