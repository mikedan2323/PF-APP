import { PointLog } from '../../types';

export const MOCK_POINTS_LOG: PointLog[] = [
    { id: 'pl1', ts: '2024-05-12', group: 'Lions', reason: 'Uniform Inspection', points: 10, by: 'Director' },
    { id: 'pl2', ts: '2024-05-12', group: 'Eagles', reason: 'Bible Verse Memory', points: 15, by: 'Leader' },
    { id: 'pl3', ts: '2024-05-05', group: 'Bears', reason: 'Late for Meeting', points: -5, by: 'Counsellor' },
    { id: 'pl4', ts: '2024-05-05', group: 'Lions', reason: 'Classwork Complete', points: 20, by: 'Leader', members: ['Carl Sagan'] },
];

export const MOCK_LEADERBOARD = [
    { group: 'Lions', total: 150 },
    { group: 'Eagles', total: 125 },
    { group: 'Bears', total: 110 },
    { group: 'Wolves', total: 95 },
];