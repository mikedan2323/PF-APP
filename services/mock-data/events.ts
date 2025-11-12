import { Event } from '../../types';

const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

export const MOCK_EVENTS: Event[] = [
    { id: 'evt1', title: 'Regular Club Meeting', start: new Date(new Date(today).setHours(10, 0, 0)), end: new Date(new Date(today).setHours(12, 0, 0)), category: 'Club Meeting' },
    { id: 'evt2', title: 'Pathfinder Camporee', start: nextWeek, end: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), category: 'Campout', allDay: true },
    { id: 'evt3', title: 'Community Can Drive', start: lastWeek, end: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000), category: 'Community Service' },
];