// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Member } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Member) => void;
}

const AddSingleMemberForm: React.FC<{ onSave: (member: Member) => void; onClose: () => void }> = ({ onSave, onClose }) => {
    const [formData, setFormData] = React.useState<Partial<Member>>({
        id: `m_${Date.now()}`,
        fullName: '',
        group: 'Lions',
        class: 'Friend',
        dob: '',
        gender: 'Male',
        contact: '',
        status: 'Active',
        registration: { form: false, healthInfo: false, feesPaid: false }
    });

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
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Full Name*</label>
                    <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Group*</label>
                    <input type="text" name="group" value={formData.group || ''} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Class</label>
                    <input type="text" name="class" value={formData.class || ''} onChange={handleChange} className="mt-1 w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Member</Button>
            </div>
        </div>
    );
}


const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSave }) => {
    const [activeTab, setActiveTab] = React.useState<'single' | 'multiple'>('single');

    return (
        <Modal show={isOpen} onClose={onClose} title="Add Member" size="lg">
             <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('single')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'single' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}>Add Single Member</button>
                <button onClick={() => setActiveTab('multiple')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'multiple' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}>Add Multiple Members</button>
            </div>
            {activeTab === 'single' ? (
                <AddSingleMemberForm onSave={onSave} onClose={onClose} />
            ) : (
                <div className="text-center p-8 text-slate-500">
                    <h3 className="font-semibold text-lg">Bulk Add Coming Soon</h3>
                    <p>This feature will allow you to add multiple members at once using a table interface.</p>
                </div>
            )}
        </Modal>
    );
};

export default AddMemberModal;