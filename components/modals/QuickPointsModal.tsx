import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useAlert, useUser } from '../../App';
import Spinner from '../ui/Spinner';
import { Group } from '../../types';

interface QuickPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPointsModal: React.FC<QuickPointsModalProps> = ({ isOpen, onClose }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = React.useState('');
    const [reason, setReason] = React.useState('');
    const [points, setPoints] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            api.getGroups().then(res => {
                if (res.success) {
                    setGroups(res.data);
                    if (res.data.length > 0) {
                        setSelectedGroup(res.data[0].name);
                    }
                }
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedGroup || !reason || !points) {
            addAlert('Please fill all fields.', 'warning');
            return;
        }
        setLoading(true);
        await api.addPoints({
            ts: new Date().toLocaleDateString(),
            group: selectedGroup,
            reason: reason,
            points: parseInt(points),
            by: user?.name || 'User',
        });
        addAlert('Points awarded successfully!', 'success');
        setLoading(false);
        onClose();
    };

    const inputStyles = "mt-1 w-full bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Quick Add Points">
            <Spinner show={loading} />
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Group</label>
                    <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className={inputStyles}>
                        {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Reason</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Best Inspection" className={inputStyles}/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Points</label>
                    <input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="e.g. 10 or -5" className={inputStyles}/>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Award Points</Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuickPointsModal;