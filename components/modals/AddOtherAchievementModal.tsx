import * as React from 'react';
import { Member, OtherAchievementType, MemberOtherAchievement } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useUser, useAlert } from '../../App';
import CreateCategoryModal from './CreateCategoryModal';
import Spinner from '../ui/Spinner';

interface AddOtherAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  member: Member;
  achievementTypes: OtherAchievementType[];
  achievementToEdit: MemberOtherAchievement | null;
}

const AddOtherAchievementModal: React.FC<AddOtherAchievementModalProps> = ({ isOpen, onClose, onSave, member, achievementTypes: initialTypes, achievementToEdit }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [formData, setFormData] = React.useState<Partial<MemberOtherAchievement>>({});
    const [loading, setLoading] = React.useState(false);
    const [achievementTypes, setAchievementTypes] = React.useState<OtherAchievementType[]>(initialTypes);

    const [isCreateTypeOpen, setIsCreateTypeOpen] = React.useState(false);
    const [isCreateAchievementOpen, setIsCreateAchievementOpen] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (achievementToEdit) {
                setFormData(achievementToEdit);
            } else {
                setFormData({
                    memberId: member.id,
                    type: '',
                    achievement: '',
                    dateEarned: new Date().toISOString().split('T')[0],
                    received: false,
                    notes: ''
                });
            }
        }
    }, [isOpen, achievementToEdit, member]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'type') {
            if (value === '--create--') {
                setIsCreateTypeOpen(true);
                return;
            }
            // Reset achievement when type changes
            setFormData(prev => ({ ...prev, [name]: value, achievement: '' }));
        } else if (name === 'achievement') {
            if (value === '--create--') {
                setIsCreateAchievementOpen(true);
                return;
            }
             setFormData(prev => ({ ...prev, [name]: value }));
        }
        else {
            const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleCreateType = async (newType: string) => {
        const res = await api.addOtherAchievementType(newType);
        if (res.success) {
            setAchievementTypes(res.data);
            setFormData(prev => ({ ...prev, type: newType, achievement: '' }));
            if(user) api.logAction(user.name, 'Create Achievement Type', `Created type: ${newType}`);
        }
    };
    
    const handleCreateAchievement = async (newAchievement: string) => {
        if (!formData.type) return;
        const res = await api.addOtherAchievementName(formData.type, newAchievement);
        if (res.success) {
            setAchievementTypes(res.data);
            setFormData(prev => ({...prev, achievement: newAchievement }));
            if(user) api.logAction(user.name, 'Create Achievement Name', `Created achievement: ${newAchievement} under ${formData.type}`);
        }
    };

    const handleSubmit = async () => {
        if (!formData.type || !formData.achievement || !formData.dateEarned) {
            addAlert('Please fill out all required fields.', 'warning');
            return;
        }

        setLoading(true);
        const action = achievementToEdit ? 'updateOtherAchievement' : 'recordOtherAchievement';
        const res = await api[action](formData as MemberOtherAchievement);

        if (res.success) {
            const logAction = achievementToEdit ? 'Edit Other Achievement' : 'Add Other Achievement';
            const logDetails = `${achievementToEdit ? 'Edited' : 'Added'} "${formData.achievement}" for ${member.fullName}`;
            if(user) api.logAction(user.name, logAction, logDetails);
            onSave();
        } else {
            addAlert('Failed to save achievement.', 'error');
        }
        setLoading(false);
    };

    const achievementOptions = React.useMemo(() => {
        if (!formData.type) return [];
        const selectedType = achievementTypes.find(t => t.name === formData.type);
        return selectedType ? selectedType.achievements : [];
    }, [formData.type, achievementTypes]);

    const inputStyles = "mt-1 w-full p-2 bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary disabled:bg-gray-border/50";
    const title = `${achievementToEdit ? 'Edit' : 'Add'} Achievement for ${member.fullName}`;

    return (
        <>
            <Modal show={isOpen} onClose={onClose} title={title}>
                <Spinner show={loading} />
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Achievement Type <span className="text-danger">*</span></label>
                            <select name="type" value={formData.type || ''} onChange={handleChange} className={inputStyles}>
                                <option value="" disabled>Select Type...</option>
                                {achievementTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                <option value="--create--">Create new type...</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Achievement <span className="text-danger">*</span></label>
                            <select name="achievement" value={formData.achievement || ''} onChange={handleChange} className={inputStyles} disabled={!formData.type}>
                                <option value="" disabled>{formData.type ? 'Select...' : 'Select achievement type first...'}</option>
                                {achievementOptions.map(a => <option key={a} value={a}>{a}</option>)}
                                <option value="--create--">Create new achievement...</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                             <label className="block text-sm font-medium">Date Earned</label>
                             <input type="date" name="dateEarned" value={formData.dateEarned || ''} onChange={handleChange} className={inputStyles} />
                        </div>
                        <label className="flex items-center pb-2">
                            <input type="checkbox" name="received" checked={formData.received || false} onChange={handleChange} className="mr-2 h-4 w-4 rounded text-primary focus:ring-primary"/>
                            Member has received physical item
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Notes</label>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={inputStyles} placeholder="Optional notes..."></textarea>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>Save</Button>
                </div>
            </Modal>
             <CreateCategoryModal
                isOpen={isCreateTypeOpen}
                onClose={() => setIsCreateTypeOpen(false)}
                onSave={handleCreateType}
                title="Create New Achievement Type"
                label="Type Name"
            />
            <CreateCategoryModal
                isOpen={isCreateAchievementOpen}
                onClose={() => setIsCreateAchievementOpen(false)}
                onSave={handleCreateAchievement}
                title={`Add Achievement to "${formData.type}"`}
                label="Achievement Name"
            />
        </>
    );
};

export default AddOtherAchievementModal;