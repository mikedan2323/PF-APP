// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Resource } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import CreateCategoryModal from './CreateCategoryModal';
import { useUser } from '../../App';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource | null;
    onSave: (resource: Resource) => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, resource, onSave }) => {
    const user = useUser();
    const [formData, setFormData] = React.useState<Partial<Resource>>({});
    const [categories, setCategories] = React.useState<string[]>([]);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);

    const fetchCategories = async () => {
        const res = await api.getResources();
        if (res.success) {
            setCategories(res.data.categories);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (resource) {
                setFormData(resource);
            } else {
                const userName = user?.individualName ? `${user.individualName} (${user.name})` : user?.name || 'Unknown';
                setFormData({
                    id: `res_${Date.now()}`,
                    name: '',
                    url: '',
                    category: '',
                    by: userName,
                    at: new Date().toISOString().split('T')[0],
                });
            }
        }
    }, [resource, isOpen, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'category' && value === '--create--') {
            setIsCreateCategoryOpen(true);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCreateCategory = async (newCategory: string) => {
        const res = await api.addResourceCategory(newCategory);
        if (res.success) {
            if (user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Create Resource Category', `Created category: ${newCategory}`);
            }
            setCategories(res.data);
            setFormData(prev => ({...prev, category: newCategory}));
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.url || !formData.category) return alert('All fields are required.');
        if(user) {
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            const action = resource ? 'Edit Resource' : 'Add Resource';
            const details = `${resource ? 'Edited' : 'Added'} resource: ${formData.name}`;
            api.logAction(userName, action, details);
        }
        onSave(formData as Resource);
    };

    const inputStyles = "mt-1 w-full p-2 bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <>
            <Modal show={isOpen} onClose={onClose} title={resource ? 'Edit Resource' : 'Add New Resource'}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Resource Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">URL</label>
                        <input type="url" name="url" value={formData.url || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select name="category" value={formData.category || ''} onChange={handleChange} className={inputStyles}>
                            <option value="" disabled>Select a category...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="--create--">Create new category...</option>
                        </select>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Resource</Button>
                </div>
            </Modal>
            <CreateCategoryModal
                isOpen={isCreateCategoryOpen}
                onClose={() => setIsCreateCategoryOpen(false)}
                onSave={handleCreateCategory}
                title="Create New Resource Category"
                label="Category Name"
            />
        </>
    );
};

export default ResourceModal;