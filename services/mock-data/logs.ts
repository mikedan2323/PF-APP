import { LogEntry } from '../../types';

export const MOCK_LOGS: LogEntry[] = [
    { id: 'log1', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Director', action: 'Delete Member', details: 'Deleted member: Isaac Newton (ID: m7)' },
    { id: 'log2', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Leader', action: 'Add Points', details: 'Awarded 15 points to Eagles for Bible Verse Memory' },
    { id: 'log3', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Jane Doe (Counsellor)', action: 'Save Attendance', details: 'Saved record for Friend on 2024-05-12' },
];