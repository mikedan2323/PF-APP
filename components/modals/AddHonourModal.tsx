import * as React from 'react';
import { Honour, HonourImage } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import CreateCategoryModal from './CreateCategoryModal';
import Spinner from '../ui/Spinner';
import { useUser } from '../../App';

interface AddHonourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (honour: Omit<Honour, 'id'>) => Promise<void>;
}

const AddHonourModal: React.FC<AddHonourModalProps> = ({ isOpen, onClose, onSave }) => {
    const user = useUser();
    const [formData, setFormData] = React.useState<Omit<Honour, 'id'>>({
        name: '',
        category: '',
        level: 1,
        patchUrl: '',
        instructor: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [images, setImages] = React.useState<HonourImage[]>([]);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);
    
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '', category: '', level: 1, patchUrl: '', instructor: '',
            });

            const fetchData = async () => {
                setLoading(true);
                const [catRes, imgRes] = await Promise.all([
                    api.getHonourCategories(),
                    api.getHonourImages()
                ]);
                if (catRes.success) setCategories(catRes.data);
                if (imgRes.success) setImages(imgRes.data);
                setLoading(false);
            };
            fetchData();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'category' && value === '--create--') {
            setIsCreateCategoryOpen(true);
            return;
        }

        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    const handleCreateCategory = async (newCategory: string) => {
        const res = await api.addHonourCategory(newCategory);
        if (res.success) {
            if (user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Create Honour Category', `Created category: ${newCategory}`);
            }
            setCategories(res.data);
            setFormData(prev => ({...prev, category: newCategory}));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category || !formData.patchUrl) {
            alert('Please fill name, category and select a patch.');
            return;
        }
        setLoading(true);
        if (user) {
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Add Honour', `Added new honour: ${formData.name}`);
        }
        await onSave(formData);
        setLoading(false);
    };

    const inputStyles = "mt-1 w-full p-2 bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <>
            <Modal show={isOpen} onClose={onClose} title="Add New Honour">
                <Spinner show={loading} />
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Honour Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={inputStyles}>
                                <option value="" disabled>Select category...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="--create--">Create new...</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Level</label>
                            <input type="number" name="level" value={formData.level} min="1" max="5" onChange={handleChange} className={inputStyles} />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Instructor</label>
                        <input type="text" name="instructor" value={formData.instructor} onChange={handleChange} className={inputStyles} placeholder="Instructor's Name (Optional)" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Select Patch Image</label>
                        <div className="mt-2 grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-border rounded-md bg-gray-base">
                            {images.map(image => (
                                <div key={image.id} className="relative cursor-pointer" onClick={() => setFormData(prev => ({...prev, patchUrl: image.url}))}>
                                    <img src={image.url} alt={image.name} title={image.name} className={`w-20 h-20 rounded-full object-contain p-1 border-4 ${formData.patchUrl === image.url ? 'border-primary' : 'border-gray-border bg-gray-border'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Honour'}</Button>
                </div>
            </Modal>
            <CreateCategoryModal
                isOpen={isCreateCategoryOpen}
                onClose={() => setIsCreateCategoryOpen(false)}
                onSave={handleCreateCategory}
                title="Create New Honour Category"
                label="Category Name"
            />
        </>
    );
};

export default AddHonourModal;