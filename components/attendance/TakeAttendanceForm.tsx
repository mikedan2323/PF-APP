// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../../services/api';
import { Member, AttendanceRecord } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAlert, useUser } from '../../App';

const getLocalYYYYMMDD = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

type AttendanceField = 'present' | 'bible' | 'book' | 'uniform';
type AttendanceData = {
    present: boolean;
    bible: boolean;
    book: boolean;
    uniform: boolean;
    remarks: string;
};

const TakeAttendanceForm: React.FC = () => {
    const user = useUser();
    const [step, setStep] = React.useState(1);
    const [date, setDate] = React.useState(getLocalYYYYMMDD());
    const [recorderName, setRecorderName] = React.useState(user?.individualName ? `${user.individualName} (${user.name})` : user?.name || '');
    const [classes, setClasses] = React.useState<string[]>([]);
    const [selectedClass, setSelectedClass] = React.useState('');
    const [members, setMembers] = React.useState<Member[]>([]);
    const [attendance, setAttendance] = React.useState<{ [memberId: string]: AttendanceData }>({});
    const [loading, setLoading] = React.useState(false);
    const { addAlert } = useAlert();

    const headerCheckboxRefs = {
        present: React.useRef<HTMLInputElement>(null),
        bible: React.useRef<HTMLInputElement>(null),
        book: React.useRef<HTMLInputElement>(null),
        uniform: React.useRef<HTMLInputElement>(null),
    };

    React.useEffect(() => {
        api.getMembersData().then(res => {
            if (res.success) {
                const orderedClasses = res.data.classes;
                setClasses(orderedClasses);
                if (orderedClasses.length > 0) {
                    setSelectedClass(orderedClasses[0]);
                }
            }
        });
    }, []);

    React.useEffect(() => {
        // Update indeterminate state of header checkboxes
        Object.keys(headerCheckboxRefs).forEach(key => {
            const field = key as AttendanceField;
            const ref = headerCheckboxRefs[field];
            if (ref.current) {
                const allChecked = members.length > 0 && members.every(m => attendance[m.id]?.[field]);
                const someChecked = members.some(m => attendance[m.id]?.[field]);
                ref.current.checked = allChecked;
                ref.current.indeterminate = !allChecked && someChecked;
            }
        });
    }, [attendance, members]);

    const handleStartSession = async () => {
        if (selectedClass && date && recorderName) {
            setLoading(true);
            const res = await api.getMembersData();
            if (res.success) {
                const classMembers = res.data.members.filter(m => m.class === selectedClass && m.status === 'Active');
                setMembers(classMembers);
                
                const initialAttendance: typeof attendance = {};
                classMembers.forEach(m => {
                    initialAttendance[m.id] = { present: false, bible: false, book: false, uniform: false, remarks: '' };
                });
                setAttendance(initialAttendance);
                setStep(2);
            }
            setLoading(false);
        } else {
            addAlert('Please fill in all fields.', 'warning');
        }
    };

    const handleCheckboxChange = (memberId: string, field: keyof AttendanceData, value: boolean) => {
        setAttendance(prev => {
            const newMemberAttendance = { ...prev[memberId], [field]: value };
            // If member is marked as absent, uncheck all items.
            if (field === 'present' && !value) {
                newMemberAttendance.bible = false;
                newMemberAttendance.book = false;
                newMemberAttendance.uniform = false;
            }
            return {
                ...prev,
                [memberId]: newMemberAttendance
            };
        });
    };
    
    const handleRemarksChange = (memberId: string, value: string) => {
        setAttendance(prev => {
            const newMemberAttendance = { ...prev[memberId], remarks: value };
            return {
                ...prev,
                [memberId]: newMemberAttendance
            };
        });
    };

    const handleSelectAll = (field: AttendanceField, checked: boolean) => {
        setAttendance(prev => {
            const newAttendance = { ...prev };
            members.forEach(member => {
                if (newAttendance[member.id]) {
                    newAttendance[member.id][field] = checked;
                }
            });
            return newAttendance;
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            addAlert('You must be logged in to save attendance.', 'error');
            return;
        }

        setLoading(true);
        const recordToSave: Omit<AttendanceRecord, 'id'> = {
            date,
            className: selectedClass,
            recorder: recorderName,
            records: attendance,
            pointsProcessed: false,
        };

        const response = await api.saveAttendanceRecord(recordToSave);

        if (response.success) {
            addAlert(`Attendance for ${selectedClass} on ${date} saved!`, 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Save Attendance', `Saved record for ${selectedClass} on ${date}.`);
            setStep(1);
        } else {
            addAlert('There was an error saving the attendance record.', 'error');
        }
        setLoading(false);
    };

    if (!user) return <Spinner show={true} />;
    
    const inputStyles = "mt-1 p-2 w-full bg-gray-input border border-gray-border rounded-md";

    if (step === 1) {
        return (
            <div className="max-w-md mx-auto p-4">
                 <Spinner show={loading} />
                <h3 className="text-lg font-bold text-center mb-4">Start Attendance Session</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Your Name (Recorder)</label>
                        <input type="text" value={recorderName} onChange={e => setRecorderName(e.target.value)} className={inputStyles} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyles}>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} />
                    </div>
                    <Button onClick={handleStartSession} className="w-full">Start Taking Attendance</Button>
                </div>
            </div>
        );
    }
    
    const HeaderCheckbox: React.FC<{ field: AttendanceField, label: string }> = ({ field, label }) => (
        <th className="p-3 font-medium text-text-muted text-center">
            <label className="flex flex-col items-center justify-center gap-1 cursor-pointer">
                <span>{label}</span>
                <input
                    type="checkbox"
                    ref={headerCheckboxRefs[field]}
                    onChange={e => handleSelectAll(field, e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary-dark"
                />
            </label>
        </th>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold">Taking Attendance: {selectedClass}</h3>
                    <p className="text-sm text-text-muted">{date} by {recorderName}</p>
                </div>
                <Button variant="outline" onClick={() => setStep(1)}>Change Settings</Button>
            </div>
            
            <Spinner show={loading} />
            {!loading && members.length === 0 && <p className="text-text-muted">No active members in this class.</p>}
            {!loading && members.length > 0 && (
                <div className="overflow-x-auto border border-gray-border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-base text-left">
                            <tr>
                                <th className="p-3 font-medium text-text-muted">Member</th>
                                <HeaderCheckbox field="present" label="Present" />
                                <HeaderCheckbox field="bible" label="Bible" />
                                <HeaderCheckbox field="book" label="Book" />
                                <HeaderCheckbox field="uniform" label="Uniform" />
                                <th className="p-3 font-medium text-text-muted">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => (
                                <tr key={member.id} className="border-b border-gray-border last:border-b-0">
                                    <td className="p-3 font-semibold text-text-main">{member.fullName}</td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded text-primary focus:ring-primary-dark"
                                            checked={attendance[member.id]?.present ?? false}
                                            onChange={e => handleCheckboxChange(member.id, 'present', e.target.checked)}
                                        />
                                    </td>
                                    {(['bible', 'book', 'uniform'] as const).map(field => (
                                        <td key={field} className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded text-primary focus:ring-primary-dark disabled:bg-gray-border disabled:cursor-not-allowed"
                                                checked={attendance[member.id]?.[field] ?? false}
                                                onChange={e => handleCheckboxChange(member.id, field, e.target.checked)}
                                                disabled={!attendance[member.id]?.present}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="w-full text-xs p-1 bg-gray-input border border-gray-border rounded-md disabled:bg-gray-border/50 disabled:cursor-not-allowed"
                                            value={attendance[member.id]?.remarks ?? ''}
                                            onChange={e => handleRemarksChange(member.id, e.target.value)}
                                            disabled={!attendance[member.id]?.present}
                                            placeholder="Add a note..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="mt-6 flex justify-end">
                {user.permissions.attendance.canSave && <Button type="submit" disabled={loading || members.length === 0}>Save Attendance</Button>}
            </div>
        </form>
    );
};

export default TakeAttendanceForm;
