// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Member, Group } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'react-feather';

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
    onSave: (member: Member) => void;
    onSaveMultiple: (members: Member[]) => void;
    groups: Group[];
    classes: string[];
}

const inputStyles = "w-full bg-gray-base border border-gray-border rounded-md text-sm p-1.5 focus:ring-primary focus:border-primary placeholder:text-text-muted";
const singleInputStyles = "mt-1 w-full p-2 bg-gray-base border border-gray-border rounded-md shadow-sm focus:ring-primary focus:border-primary";
const labelStyles = "block text-sm font-medium text-text-muted";


interface AddMultipleMembersFormProps {
    onSave: (members: Member[]) => void;
    groups: Group[];
    classes: string[];
}

const AddMultipleMembersForm: React.FC<AddMultipleMembersFormProps> = ({ onSave, groups, classes }) => {
    const [rows, setRows] = React.useState<Partial<Member>[]>([
        { registration: { form: false, healthInfo: false, feesPaid: false } }
    ]);

    const handleRowChange = (index: number, field: keyof Member, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const handleRegistrationChange = (index: number, field: keyof Member['registration'], value: boolean) => {
        const newRows = [...rows];
        const currentRegistration = newRows[index].registration || { form: false, healthInfo: false, feesPaid: false };
        newRows[index] = {
            ...newRows[index],
            registration: { ...currentRegistration, [field]: value }
        };
        setRows(newRows);
    };

    const addRow = () => setRows([...rows, { registration: { form: false, healthInfo: false, feesPaid: false } }]);
    const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

    const handleSubmit = () => {
        const newMembers = rows
            .filter(r => r.fullName && r.fullName.trim())
            .map((r, i) => ({
                id: `m_${Date.now()}_${i}`,
                fullName: r.fullName || '',
                group: r.group || (groups.length > 0 ? groups[0].name : ''),
                class: r.class || (classes.length > 0 ? classes[0] : ''),
                dob: r.dob || undefined,
                gender: 'Male', // Default, not in form
                contact: '', // Default, not in form
                status: 'Active',
                registration: {
                    form: r.registration?.form || false,
                    healthInfo: r.registration?.healthInfo || false,
                    feesPaid: r.registration?.feesPaid || false,
                }
            })) as Member[];

        if (newMembers.length === 0) {
            alert("Please fill out at least one member's name.");
            return;
        }
        onSave(newMembers);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-gray-border rounded-lg max-h-80">
                <table className="w-full text-sm" style={{ minWidth: '800px' }}>
                    <thead className="bg-gray-base sticky top-0">
                        <tr>
                            <th className="p-2 font-medium text-text-muted text-left">Full Name*</th>
                            <th className="p-2 font-medium text-text-muted text-left">Group</th>
                            <th className="p-2 font-medium text-text-muted text-left">Class</th>
                            <th className="p-2 font-medium text-text-muted text-left">Date of Birth</th>
                            <th className="p-2 font-medium text-text-muted text-center">Reg. Form</th>
                            <th className="p-2 font-medium text-text-muted text-center">Health Info</th>
                            <th className="p-2 font-medium text-text-muted text-center">Fees Paid</th>
                            <th className="p-2 font-medium text-text-muted"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index} className="border-b border-gray-border last:border-b-0">
                                <td className="p-1"><input type="text" value={row.fullName || ''} onChange={e => handleRowChange(index, 'fullName', e.target.value)} className={inputStyles} /></td>
                                <td className="p-1">
                                    <select value={row.group || ''} onChange={e => handleRowChange(index, 'group', e.target.value)} className={inputStyles}>
                                        <option value="" disabled>Select...</option>
                                        {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                                    </select>
                                </td>
                                <td className="p-1">
                                    <select value={row.class || ''} onChange={e => handleRowChange(index, 'class', e.target.value)} className={inputStyles}>
                                        <option value="" disabled>Select...</option>
                                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </td>
                                <td className="p-1"><input type="date" value={row.dob || ''} onChange={e => handleRowChange(index, 'dob', e.target.value)} className={inputStyles} /></td>
                                <td className="p-1 text-center"><input type="checkbox" checked={row.registration?.form || false} onChange={e => handleRegistrationChange(index, 'form', e.target.checked)} className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary" /></td>
                                <td className="p-1 text-center"><input type="checkbox" checked={row.registration?.healthInfo || false} onChange={e => handleRegistrationChange(index, 'healthInfo', e.target.checked)} className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary" /></td>
                                <td className="p-1 text-center"><input type="checkbox" checked={row.registration?.feesPaid || false} onChange={e => handleRegistrationChange(index, 'feesPaid', e.target.checked)} className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary" /></td>
                                <td className="p-1 text-center"><Button size="sm" variant="danger" onClick={() => removeRow(index)}><Trash2 size={14} /></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button variant="outline" size="sm" onClick={addRow} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Add Row
            </Button>
            <div className="mt-6 flex justify-end gap-3">
                <Button onClick={handleSubmit}>Save All New Members</Button>
            </div>
        </div>
    );
};


const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, member, onSave, onSaveMultiple, groups, classes }) => {
    const [formData, setFormData] = React.useState<Partial<Member>>({});
    const [activeTab, setActiveTab] = React.useState<'single' | 'multiple'>('single');

    React.useEffect(() => {
        if (isOpen) {
            if (member) {
                setFormData(member);
                setActiveTab('single');
            } else {
                setFormData({
                    id: `m_${Date.now()}`,
                    fullName: '',
                    group: groups.length > 0 ? groups[0].name : '',
                    class: classes.length > 0 ? classes[0] : '',
                    dob: '',
                    gender: 'Male',
                    contact: '',
                    status: 'Active',
                    registration: { form: false, healthInfo: false, feesPaid: false }
                });
            }
        }
    }, [member, isOpen, groups, classes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            registration: {
                ...prev.registration!,
                [name]: checked
            }
        }));
    };

    const handleSubmit = () => {
        if (!formData.fullName || !formData.group) {
            alert('Full Name and Group are required.');
            return;
        }
        onSave(formData as Member);
    };

    return (
        <Modal show={isOpen} onClose={onClose} title={member ? 'Edit Member' : 'Add New Member'} size="lg">
             <div className="flex border-b border-gray-border mb-4">
                <button disabled={!!member} onClick={() => setActiveTab('single')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'single' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'} disabled:text-text-subtle disabled:cursor-not-allowed`}>Add Single Member</button>
                <button disabled={!!member} onClick={() => setActiveTab('multiple')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'multiple' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'} disabled:text-text-subtle disabled:cursor-not-allowed`}>Add Multiple Members</button>
            </div>

            {activeTab === 'single' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyles}>Full Name*</label>
                            <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className={singleInputStyles} />
                        </div>
                        <div>
                            <label className={labelStyles}>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className={singleInputStyles} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelStyles}>Group*</label>
                            <select name="group" value={formData.group || ''} onChange={handleChange} className={singleInputStyles}>
                                {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyles}>Class</label>
                             <select name="class" value={formData.class || ''} onChange={handleChange} className={singleInputStyles}>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyles}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className={singleInputStyles}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelStyles}>Parent/Guardian Contact</label>
                        <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} className={singleInputStyles} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyles}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={singleInputStyles}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyles}>Completion Checkboxes</label>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center"><input type="checkbox" name="form" checked={formData.registration?.form} onChange={handleRegistrationChange} className="mr-2 rounded text-primary focus:ring-primary" /> Registration Form</label>
                                <label className="flex items-center"><input type="checkbox" name="healthInfo" checked={formData.registration?.healthInfo} onChange={handleRegistrationChange} className="mr-2 rounded text-primary focus:ring-primary" /> Health Info</label>
                                <label className="flex items-center"><input type="checkbox" name="feesPaid" checked={formData.registration?.feesPaid} onChange={handleRegistrationChange} className="mr-2 rounded text-primary focus:ring-primary" /> Fees Paid</label>
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save Member</Button>
                    </div>
                </div>
            ) : (
                <AddMultipleMembersForm onSave={onSaveMultiple} groups={groups} classes={classes} />
            )}
        </Modal>
    );
};

export default MemberModal;