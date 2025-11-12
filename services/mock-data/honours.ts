import { Honour, MemberHonourStatus, HonourImage } from '../../types';

export const MOCK_HONOUR_CATEGORIES: string[] = [
    'Outdoors', 'Health', 'Crafts', 'Spiritual'
];

export const MOCK_HONOUR_IMAGES: HonourImage[] = [
    { id: 'img1', name: 'Camping Tent', url: 'https://img.icons8.com/color/96/camping-tent.png' },
    { id: 'img2', name: 'First Aid Kit', url: 'https://img.icons8.com/color/96/first-aid-kit.png' },
    { id: 'img3', name: 'Rope Coil', url: 'https://img.icons8.com/color/96/rope-coil.png' },
    { id: 'img4', name: 'Bible', url: 'https://img.icons8.com/color/96/bible.png' },
];

export const MOCK_HONOURS: Honour[] = [
    { id: 'h1', name: 'Camping Skills I', category: 'Outdoors', level: 1, patchUrl: 'https://img.icons8.com/color/96/camping-tent.png', instructor: 'John Muir' },
    { id: 'h2', name: 'First Aid, Basic', category: 'Health', level: 1, patchUrl: 'https://img.icons8.com/color/96/first-aid-kit.png', instructor: 'Florence Nightingale' },
    { id: 'h3', name: 'Knots', category: 'Outdoors', level: 1, patchUrl: 'https://img.icons8.com/color/96/rope-coil.png' },
];

export const MOCK_HONOUR_STATUS: MemberHonourStatus = {
    'm1': { 'h1': 'Completed', 'h2': 'In Progress' },
    'm2': { 'h1': 'In Progress', 'h3': 'Completed' },
    'm5': { 'h2': 'Not Started' },
};