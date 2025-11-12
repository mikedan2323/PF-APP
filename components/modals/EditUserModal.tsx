import * as React from 'react';
import { AppUser, Role } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  onSave: (userId: string, data: { name: string, role: string }) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = React.useState('');
    const [role, setRole] = React.useState('');
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setRole(user.role);
            api.getRoles().then(res => {
                if(res.success) setRoles(res.data);
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        await onSave(user.id, { name, role });
        setLoading(false);
        onClose();
    };

    if (!user) return null;
    
    const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title={`Edit User: ${user.name}`}>
            <Spinner show={loading} />
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={inputStyles}>
                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>Save Changes</Button>
            </div>
        </Modal>
    );
};

export default EditUserModal;