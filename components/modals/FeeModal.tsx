// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Member, Fee } from '../../types';
import { api } from '../../services/api';

interface FeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: Member[];
    onSave: () => void;
}

const FeeModal: React.FC<FeeModalProps> = ({ isOpen, onClose, members, onSave }) => {
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
    const [amount, setAmount] = React.useState('');
    const [type, setType] = React.useState<Fee['type']>('Late');
    const [otherTypeReason, setOtherTypeReason] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens for a fresh start
            setSelectedMemberIds([]);
            setAmount('');
            setType('Late');
            setOtherTypeReason('');
            setDueDate('');
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredMembers = React.useMemo(() => {
        return members.filter(member => 
            member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);
    
    const handleSubmit = async () => {
        if (selectedMemberIds.length === 0 || !amount || !type || !dueDate) {
            alert('Please fill all fields and select at least one member.');
            return;
        }
        if (type === 'Other' && !otherTypeReason.trim()) {
            alert('Please provide a reason for the "Other" fee type.');
            return;
        }

        const feeAmount = parseFloat(amount);
        for (const memberId of selectedMemberIds) {
            const member = members.find(m => m.id === memberId);
            if(member) {
                 const feePayload: Omit<Fee, 'id'> = {
                    memberId: member.id,
                    memberName: member.fullName,
                    group: member.group,
                    type,
                    amount: feeAmount,
                    dueDate,
                    status: 'Unpaid',
                    ...(type === 'Other' && { otherTypeReason: otherTypeReason.trim() })
                 };
                 await api.addFee(feePayload);
            }
        }
        onSave();
    };

    const handleSelectAllVisible = () => {
        const visibleIds = filteredMembers.map(m => m.id);
        const newSelectedIds = new Set([...selectedMemberIds, ...visibleIds]);
        setSelectedMemberIds(Array.from(newSelectedIds));
    };

    const handleClearSelection = () => {
        setSelectedMemberIds([]);
    };

    const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";
    
    return (
        <Modal show={isOpen} onClose={onClose} title="Add Fee" size="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2 text-text-muted">Select Members ({selectedMemberIds.length} selected)</h3>
                    <input
                        type="text"
                        placeholder="Search for a member..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full mb-2 p-2 bg-gray-input border border-gray-border rounded-md text-sm"
                    />
                    <div className="flex items-center gap-2 mb-2 text-xs">
                        <button type="button" onClick={handleSelectAllVisible} className="text-primary hover:underline">Select All Visible</button>
                        <span>|</span>
                        <button type="button" onClick={handleClearSelection} className="text-primary hover:underline">Clear Selection</button>
                    </div>
                    <div className="h-64 overflow-y-auto border border-gray-border rounded-md p-2 bg-gray-base">
                        {filteredMembers.map(member => (
                            <div key={member.id}>
                                <label className="flex items-center p-1 rounded-md hover:bg-gray-border/50">
                                    <input
                                        type="checkbox"
                                        className="mr-2 rounded text-primary focus:ring-primary"
                                        checked={selectedMemberIds.includes(member.id)}
                                        onChange={() => {
                                            setSelectedMemberIds(prev =>
                                                prev.includes(member.id)
                                                    ? prev.filter(id => id !== member.id)
                                                    : [...prev, member.id]
                                            );
                                        }}
                                    />
                                    {member.fullName} <span className="text-xs text-text-muted ml-2">({member.group})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Fee Type</label>
                        <select value={type} onChange={e => setType(e.target.value as Fee['type'])} className={inputStyles}>
                            <option value="Late">Late</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {type === 'Other' && (
                        <div>
                            <label className="block text-sm font-medium text-text-muted">Reason for "Other"</label>
                            <input 
                                type="text" 
                                value={otherTypeReason} 
                                onChange={e => setOtherTypeReason(e.target.value)}
                                placeholder="e.g., Camporee, Registration"
                                className={inputStyles} 
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-muted">Amount ($)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted">Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputStyles} />
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Add Fee to Selected</Button>
            </div>
        </Modal>
    );
};

export default FeeModal;