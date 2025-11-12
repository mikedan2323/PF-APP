import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';
import { Member, AttendanceRecord } from '../../types';
import { useAlert, useUser } from '../../App';

interface QuickAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({ isOpen, onClose }) => {
    const user = useUser();
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [classes, setClasses] = React.useState<string[]>([]);
    const [selectedClass, setSelectedClass] = React.useState('');
    const [members, setMembers] = React.useState<Member[]>([]);
    const [presentIds, setPresentIds] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const { addAlert } = useAlert();

    React.useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.getMembersData().then(res => {
                if (res.success) {
                    // FIX: Use Array.from() to correctly infer the type from the Set iterator.
                    // The spread syntax was incorrectly inferring `unknown[]`.
                    const uniqueClasses: string[] = Array.from(new Set(res.data.members.map((m: Member) => m.class)));
                    setClasses(uniqueClasses);
                    if (uniqueClasses.length > 0) {
                        setSelectedClass(uniqueClasses[0]);
                    }
                }
                setLoading(false);
            });
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (selectedClass) {
            setLoading(true);
            api.getMembersData().then(res => {
                if (res.success) {
                    const classMembers = res.data.members.filter((m: Member) => m.class === selectedClass && m.status === 'Active');
                    setMembers(classMembers);
                    setPresentIds(new Set(classMembers.map(m => m.id))); // Default all to present
                }
                setLoading(false);
            });
        }
    }, [selectedClass]);

    const handleTogglePresent = (memberId: string) => {
        setPresentIds(prev => {
            const next = new Set(prev);
            if (next.has(memberId)) next.delete(memberId);
            else next.add(memberId);
            return next;
        });
    };
    
    const handleSubmit = async () => {
        const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
            date,
            className: selectedClass,
            recorder: user?.name || 'Unknown',
            records: members.reduce((acc, member) => {
                acc[member.id] = {
                    present: presentIds.has(member.id),
                    bible: presentIds.has(member.id), // simplified for quick modal
                    book: presentIds.has(member.id),
                    uniform: presentIds.has(member.id),
                };
                return acc;
            }, {} as any),
            pointsProcessed: false,
        };
        await api.saveAttendanceRecord(attendanceRecord);
        addAlert('Attendance saved!', 'success');
        onClose();
    };

    const inputStyles = "w-full bg-gray-input border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Quick Attendance">
            <Spinner show={loading} />
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyles}>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-border rounded-lg p-2 grid grid-cols-2 gap-2">
                    {members.map(member => (
                        <label key={member.id} className="flex items-center p-2 rounded hover:bg-gray-border/50">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded mr-2 text-primary focus:ring-primary"
                                checked={presentIds.has(member.id)}
                                onChange={() => handleTogglePresent(member.id)}
                            />
                            <span className="text-sm">{member.fullName}</span>
                        </label>
                    ))}
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Attendance</Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuickAttendanceModal;
