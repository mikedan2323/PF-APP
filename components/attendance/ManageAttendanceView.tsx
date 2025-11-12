// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../../services/api';
import { AttendanceRecord, Member } from '../../types';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { Edit, Save, Trash2, X, Award, CheckCircle, Shield } from 'react-feather';
import ConfirmationModal from '../modals/ConfirmationModal';
import { useAlert, useUser } from '../../App';

type AttendanceField = 'present' | 'bible' | 'book' | 'uniform';

const ManageAttendanceView: React.FC = () => {
    const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [recordToDelete, setRecordToDelete] = React.useState<AttendanceRecord | null>(null);
    const { addAlert } = useAlert();
    const user = useUser();

    // New state for date filtering and editing
    const [selectedDate, setSelectedDate] = React.useState('');
    const [editingRecordId, setEditingRecordId] = React.useState<string | null>(null);
    const [editableRecordData, setEditableRecordData] = React.useState<AttendanceRecord['records'] | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [recordsRes, membersRes] = await Promise.all([
            api.getAttendanceRecords(),
            api.getMembersData()
        ]);
        if (recordsRes.success) {
            setRecords(recordsRes.data);
        }
        if (membersRes.success) setMembers(membersRes.data.members);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const availableDates = React.useMemo(() => {
        const dates = [...new Set(records.map(r => r.date))];
        return dates.sort((a: string, b: string) => b.localeCompare(a)); // Sort descending
    }, [records]);

    React.useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    const filteredRecords = React.useMemo(() => {
        if (!selectedDate) return [];
        return records.filter(r => r.date === selectedDate).sort((a,b) => a.className.localeCompare(b.className));
    }, [records, selectedDate]);

    const handleEdit = (record: AttendanceRecord) => {
        setEditingRecordId(record.id);
        setEditableRecordData(JSON.parse(JSON.stringify(record.records))); // Deep copy
    };

    const handleCancelEdit = () => {
        setEditingRecordId(null);
        setEditableRecordData(null);
    };

    const handleCheckboxChange = (memberId: string, field: AttendanceField, value: boolean) => {
        if (!editableRecordData) return;
        setEditableRecordData(prev => {
            const recordData = { ...prev! };
            const currentRecord = { ...recordData[memberId] };
            currentRecord[field] = value;

            // If member is marked as absent, uncheck all items. Excuses remain.
            if (field === 'present' && !value) {
                currentRecord.bible = false;
                currentRecord.book = false;
                currentRecord.uniform = false;
            }
            recordData[memberId] = currentRecord;
            return recordData;
        });
    };

    const handleExcuseToggle = (memberId: string, field: AttendanceField) => {
        if (!editableRecordData) return;
        setEditableRecordData(prev => {
            const currentRecord = prev![memberId];
            const currentExcused = currentRecord.excused || {};
            const newExcusedState = !currentExcused[field];
            
            const newExcusedObject: typeof currentExcused = { ...currentExcused, [field]: newExcusedState };

            if (field === 'present') {
                newExcusedObject.bible = newExcusedState;
                newExcusedObject.book = newExcusedState;
                newExcusedObject.uniform = newExcusedState;
            }

            return {
                ...prev!,
                [memberId]: {
                    ...currentRecord,
                    excused: newExcusedObject
                }
            }
        });
    };
    
    const handleRemarksChange = (memberId: string, value: string) => {
        if (!editableRecordData) return;
        setEditableRecordData(prev => {
            if (!prev) return null;
            const newRecordData = { ...prev };
            newRecordData[memberId] = { ...newRecordData[memberId], remarks: value };
            return newRecordData;
        });
    };


    const handleSaveEdit = async () => {
        if (!editingRecordId || !editableRecordData || !user) return;
        setLoading(true);
        const res = await api.updateAttendanceRecord(editingRecordId, editableRecordData);
        if (res.success) {
            addAlert('Record updated successfully!', 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Update Attendance', `Updated record ID: ${editingRecordId}`);
            handleCancelEdit();
            await fetchData();
        } else {
            addAlert('Failed to update record.', 'error');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!recordToDelete || !user) return;
        const res = await api.deleteAttendanceRecord(recordToDelete.id);
        if (res.success) {
            addAlert(`Deleted attendance record for ${recordToDelete.date}.`, 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Delete Attendance', `Deleted record for ${recordToDelete.className} on ${recordToDelete.date}`);
            setRecordToDelete(null);
            fetchData();
        } else {
            addAlert('Failed to delete record.', 'error');
        }
    };
    
    const handleProcessPoints = async (recordId: string) => {
        if (!user) return;
        setLoading(true);
        const res = await api.processAttendancePoints(recordId);
        if (res.success) {
            addAlert('Points have been processed and added to the points log.', 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Process Points', `Processed points for record ID: ${recordId}`);
            fetchData();
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        }
        setLoading(false);
    };

    const getMemberName = (id: string) => members.find(m => m.id === id)?.fullName || 'Unknown Member';

    if (loading || !user) return <Spinner show={true} />;
    
    const StatusIndicator: React.FC<{ status: boolean; excused?: boolean; field: AttendanceField }> = ({ status, excused, field }) => {
        const titleMap = {
            present: { true: 'Present', false: 'Absent' },
            bible: { true: 'Has Bible', false: 'Missing Bible' },
            book: { true: 'Has Book', false: 'Missing Book' },
            uniform: { true: 'Has Uniform', false: 'Missing Uniform' },
        };
    
        if (status) return <span title={titleMap[field].true}>✔️</span>;
        if (excused) return <Shield size={16} className="text-primary mx-auto" title="Excused" />;
        return <span title={titleMap[field].false}>❌</span>;
    };


    return (
        <>
            {records.length > 0 && (
                 <div className="mb-10 p-4 border border-gray-border rounded-lg bg-gray-surface/50 flex items-center gap-4">
                    <label htmlFor="attendance-date" className="font-medium text-sm">Select Date:</label>
                     <select
                        id="attendance-date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-gray-input border-gray-border rounded-md text-sm p-2"
                    >
                        {availableDates.map(date => (
                            <option key={date} value={date}>
                                {date}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-4">
                {records.length === 0 ? (
                    <div className="text-center p-8 text-text-muted">
                        <h3 className="font-semibold text-lg">No Attendance Records Found</h3>
                        <p>Go to the "Take Attendance" tab to create your first record.</p>
                    </div>
                ) : (
                    filteredRecords.map(record => {
                        const isEditing = editingRecordId === record.id;
                        const canProcess = user.permissions.attendance.canProcessPoints;
                        const canEdit = user.permissions.attendance.canEdit;
                        const canDelete = user.permissions.attendance.canDelete;
                        return (
                            <div key={record.id} className="border border-gray-border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold">{record.className} Class</h4>
                                        <p className="text-sm text-text-muted">Recorded by {record.recorder}</p>
                                        {record.pointsProcessed && (
                                            <div className="flex items-center text-xs text-success mt-1">
                                                <CheckCircle size={14} className="mr-1" /> Points Processed
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button size="sm" variant="outline" onClick={handleCancelEdit}><X size={14} className="mr-1" /> Cancel</Button>
                                                <Button size="sm" variant="success" onClick={handleSaveEdit}><Save size={14} className="mr-1" /> Save</Button>
                                            </>
                                        ) : (
                                            <>
                                                {canProcess && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleProcessPoints(record.id)} 
                                                        disabled={record.pointsProcessed}
                                                        title={record.pointsProcessed ? "Points have already been processed for this record" : "Calculate and award points based on this attendance record"}
                                                    >
                                                        <Award size={14} className="mr-1" /> Process Points
                                                    </Button>
                                                )}
                                                {canEdit && <Button size="sm" variant="outline" onClick={() => handleEdit(record)}><Edit size={14} /> Edit</Button>}
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => setRecordToDelete(record)}><Trash2 size={14} /></Button>}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="overflow-x-auto border border-gray-border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-base text-left">
                                            <tr>
                                                <th className="p-2 font-medium">Member</th>
                                                <th className="p-2 font-medium text-center">Present</th>
                                                <th className="p-2 font-medium text-center">Bible</th>
                                                <th className="p-2 font-medium text-center">Book</th>
                                                <th className="p-2 font-medium text-center">Uniform</th>
                                                <th className="p-2 font-medium">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(record.records).map((memberId) => {
                                                const data = record.records[memberId];
                                                const isEditing = editingRecordId === record.id;
                                                return (
                                                <tr key={memberId} className="border-t border-gray-border">
                                                    <td className="p-2 font-medium">{getMemberName(memberId)}</td>
                                                    {(['present', 'bible', 'book', 'uniform'] as AttendanceField[]).map(fieldKey => {
                                                        const memberData = isEditing ? editableRecordData?.[memberId] : data;
                                                        const status = memberData?.[fieldKey] ?? false;
                                                        const isExcused = memberData?.excused?.[fieldKey] ?? false;
                                                        const isPresent = isEditing ? editableRecordData?.[memberId]?.present : data.present;

                                                        return (
                                                            <td key={fieldKey} className="p-2 text-center">
                                                                {isEditing ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="h-5 w-5 rounded text-primary focus:ring-primary-dark disabled:bg-gray-border disabled:cursor-not-allowed"
                                                                            checked={status}
                                                                            onChange={e => handleCheckboxChange(memberId, fieldKey, e.target.checked)}
                                                                            disabled={fieldKey !== 'present' && !isPresent}
                                                                        />
                                                                        {!status && (
                                                                            <Button 
                                                                                size="sm"
                                                                                variant={isExcused ? "primary" : "outline"}
                                                                                onClick={() => handleExcuseToggle(memberId, fieldKey)}
                                                                                className="px-2 py-0.5 text-xs"
                                                                                // FIX: The disabled condition had a redundant check.
                                                                                disabled={fieldKey !== 'present' && !isPresent}
                                                                            >
                                                                                {isExcused ? 'Excused' : 'Excuse'}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <StatusIndicator status={status} excused={isExcused} field={fieldKey} />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 text-xs text-text-muted w-1/4">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editableRecordData?.[memberId]?.remarks || ''}
                                                                onChange={(e) => handleRemarksChange(memberId, e.target.value)}
                                                                className="w-full text-xs p-1 bg-gray-input border border-gray-border rounded-md"
                                                                placeholder="Add note..."
                                                                disabled={!editableRecordData?.[memberId]?.present}
                                                            />
                                                        ) : (
                                                            data?.remarks
                                                        )}
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <ConfirmationModal
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Attendance Record"
                message={`Are you sure you want to delete the attendance record for ${recordToDelete?.className} on ${recordToDelete?.date}? This action cannot be undone.`}
            />
        </>
    );
};

export default ManageAttendanceView;
