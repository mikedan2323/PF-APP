import { Fee } from '../../types';

export const MOCK_FEES: Fee[] = [
    { id: 'f1', memberId: 'm1', memberName: 'Carl Sagan', group: 'Lions', type: 'Late', amount: 25.00, dueDate: '2024-04-30', status: 'Unpaid' },
    { id: 'f2', memberId: 'm3', memberName: 'Grace Hopper', group: 'Bears', type: 'Other', otherTypeReason: 'Camporee Fee', amount: 75.00, dueDate: '2024-05-10', status: 'Paid' },
    { id: 'f3', memberId: 'm4', memberName: 'Alan Turing', group: 'Wolves', type: 'Late', amount: 15.00, dueDate: '2024-05-15', status: 'Waived' },
];