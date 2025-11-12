// Implemented the EditAccessCodeModal component for the Admin page to resolve module resolution errors.
import * as React from 'react';
import { AppUser } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAlert } from '../../App';
import { RefreshCw } from 'react-feather';

interface EditAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
}

const EditAccessCodeModal: React.FC<EditAccessCodeModalProps> = ({ isOpen, onClose, user }) => {
    const [code, setCode] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { addAlert } = useAlert();

    React.useEffect(() => {
        if (user) {
            // In a real app, you'd fetch this code. Here we'll just generate one.
            setCode(Math.floor(1000 + Math.random() * 9000).toString());
        }
    }, [user]);

    const generateCode = () => {
        setCode(Math.floor(1000 + Math.random() * 9000).toString());
    }

    const handleSubmit = async () => {
        if (!user || !code) return;
        setLoading(true);
        // Pretend to call an API
        await new Promise(res => setTimeout(res, 500));
        addAlert(`Access code for ${user.name} updated successfully!`, 'success');
        setLoading(false);
        onClose();
    };

    if (!user) return null;
    
    const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title={`Access Code for ${user.name}`}>
            <Spinner show={loading} />
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Access Code</label>
                    <div className="flex gap-2 mt-1">
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputStyles} placeholder="Enter 4-digit code" />
                        <Button variant="outline" onClick={generateCode}><RefreshCw size={16}/></Button>
                    </div>
                </div>
                 <div className="my-4 p-4 bg-gray-base border-2 border-dashed border-gray-border rounded-lg text-center">
                    <p className="text-3xl font-bold tracking-widest text-primary">{code}</p>
                 </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>Save New Code</Button>
            </div>
        </Modal>
    );
};

export default EditAccessCodeModal;