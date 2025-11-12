import { Member, Group } from '../../types';

export const MOCK_GROUPS: Group[] = [
    { name: 'Lions', color: '#FBBF24' },
    { name: 'Eagles', color: '#3B82F6' },
    { name: 'Bears', color: '#84CC16' },
    { name: 'Wolves', color: '#9CA3AF' }
];
export const MOCK_CLASSES: string[] = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];
export const DEFAULT_GROUPS = ['Lions', 'Eagles', 'Bears', 'Wolves'];


export const MOCK_MEMBERS: Member[] = [
    { id: 'm1', fullName: 'Carl Sagan', group: 'Lions', class: 'Guide', dob: '2008-11-09', gender: 'Male', contact: '555-1234', status: 'Active', registration: { form: true, healthInfo: true, feesPaid: true } },
    { id: 'm2', fullName: 'Ada Lovelace', group: 'Eagles', class: 'Voyager', dob: '2009-12-10', gender: 'Female', contact: '555-5678', status: 'Active', registration: { form: true, healthInfo: false, feesPaid: true } },
    { id: 'm3', fullName: 'Grace Hopper', group: 'Bears', class: 'Ranger', dob: '2010-09-06', gender: 'Female', contact: '555-8765', status: 'Active', registration: { form: true, healthInfo: true, feesPaid: false } },
    { id: 'm4', fullName: 'Alan Turing', group: 'Wolves', class: 'Explorer', dob: '2011-06-23', gender: 'Male', contact: '555-4321', status: 'Active', registration: { form: false, healthInfo: false, feesPaid: false } },
    { id: 'm5', fullName: 'Marie Curie', group: 'Lions', class: 'Companion', dob: '2012-11-07', gender: 'Female', contact: '555-1122', status: 'Active', registration: { form: true, healthInfo: true, feesPaid: true } },
    { id: 'm6', fullName: 'Nikola Tesla', group: 'Eagles', class: 'Friend', dob: '2013-07-10', gender: 'Male', contact: '555-3344', status: 'Active', registration: { form: true, healthInfo: true, feesPaid: true } },
    { id: 'm7', fullName: 'Isaac Newton', group: 'Bears', class: 'Guide', dob: '2008-01-04', gender: 'Male', contact: '555-5566', status: 'Inactive', registration: { form: true, healthInfo: true, feesPaid: true } },
];