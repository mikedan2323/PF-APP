import { AttendanceRecord } from '../../types';

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
    {
        id: 'att1',
        date: '2024-05-12',
        className: 'Friend',
        recorder: 'Jane Doe',
        records: {
            'm6': { present: true, bible: true, book: true, uniform: false },
        },
        pointsProcessed: true,
    },
    {
        id: 'att2',
        date: '2024-05-12',
        className: 'Guide',
        recorder: 'Director',
        records: {
            'm1': { present: true, bible: true, book: true, uniform: true },
            'm7': { present: false, bible: false, book: false, uniform: false, excused: { present: true } },
        },
        pointsProcessed: false,
    },
    {
        id: 'att3',
        date: '2024-05-05',
        className: 'Guide',
        recorder: 'Director',
        records: {
            'm1': { present: true, bible: true, book: false, uniform: true, excused: { book: true } },
            'm7': { present: true, bible: true, book: true, uniform: true },
        },
        pointsProcessed: true,
    },
];