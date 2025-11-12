import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';
import { HonourImage } from '../../types';
import { useAlert, useUser } from '../../App';
import { Trash2 } from 'react-feather';

interface HonourImageManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HonourImageManagementModal: React.FC<HonourImageManagementModalProps> = ({ isOpen, onClose }) => {
    const user = useUser();
    const [images, setImages] = React.useState<HonourImage[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const [newUrl, setNewUrl] = React.useState('');
    const { addAlert } = useAlert();

    const fetchData = async () => {
        setLoading(true);
        const res = await api.getHonourImages();
        if (res.success) {
            setImages(res.data);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleAddImage = async () => {
        if (!newName.trim() || !newUrl.trim()) {
            addAlert('Please provide a name and a URL.', 'warning');
            return;
        }
        setLoading(true);
        const res = await api.addHonourImage(newName, newUrl);
        if (res.success) {
            addAlert('Image added to library.', 'success');
            if (user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Add Honour Image', `Added image: ${newName}`);
            }
            setNewName('');
            setNewUrl('');
            await fetchData();
        } else {
            addAlert('Failed to add image.', 'error');
        }
        setLoading(false);
    };
    
    const handleDeleteImage = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this image from the library?')) {
            setLoading(true);
            const res = await api.deleteHonourImage(id);
            if(res.success) {
                addAlert('Image removed.', 'success');
                if (user) {
                    const imageName = images.find(i => i.id === id)?.name || `ID ${id}`;
                    const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                    api.logAction(userName, 'Delete Honour Image', `Deleted image: ${imageName}`);
                }
                await fetchData();
            } else {
                addAlert('Failed to remove image.', 'error');
            }
            setLoading(false);
        }
    };
    
    const inputStyles = "w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Manage Honour Images" size="lg">
            <Spinner show={loading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-text-muted mb-2">Add New Image</h3>
                    <div className="space-y-3 p-4 bg-gray-surface border border-gray-border rounded-lg">
                        <div>
                            <label className="text-sm">Image Name</label>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Camping Tent" className={inputStyles}/>
                        </div>
                        <div>
                            <label className="text-sm">Image URL</label>
                            <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className={inputStyles}/>
                        </div>
                        <Button onClick={handleAddImage} className="w-full">Add to Library</Button>
                    </div>
                </div>
                <div>
                     <h3 className="font-semibold text-text-muted mb-2">Image Library</h3>
                     <div className="h-96 overflow-y-auto space-y-2 p-2 border border-gray-border rounded-lg bg-gray-base">
                        {images.map(image => (
                            <div key={image.id} className="flex items-center justify-between p-2 bg-gray-surface rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={image.url} alt={image.name} className="w-10 h-10 rounded-full bg-gray-border object-contain"/>
                                    <span className="text-sm font-medium">{image.name}</span>
                                </div>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteImage(image.id)}><Trash2 size={14}/></Button>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Done</Button>
            </div>
        </Modal>
    )
}

export default HonourImageManagementModal;