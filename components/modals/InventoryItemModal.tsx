// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { InventoryItem } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import CreateCategoryModal from './CreateCategoryModal';
import { useUser } from '../../App';

interface InventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onSave: (item: InventoryItem) => void;
}

type CategoryStructure = { name: string; subcategories: string[] };

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ isOpen, onClose, item, onSave }) => {
    const user = useUser();
    const [formData, setFormData] = React.useState<Partial<InventoryItem>>({});
    const [categories, setCategories] = React.useState<CategoryStructure[]>([]);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);
    const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] = React.useState(false);

    const fetchCategories = async () => {
        const res = await api.getInventoryData();
        if (res.success) {
            setCategories(res.data.categories);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (item) {
                setFormData(item);
            } else {
                setFormData({
                    id: `inv_${Date.now()}`,
                    name: '',
                    category: '',
                    subcategory: '',
                    quantity: 0,
                    minStock: 0,
                    gender: 'Unisex',
                });
            }
        }
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'category') {
            if (value === '--create--') {
                setIsCreateCategoryOpen(true);
                return;
            }
            // Reset subcategory when category changes
            setFormData(prev => ({ ...prev, [name]: value, subcategory: '' }));
        } else if (name === 'subcategory') {
            if (value === '--create--') {
                setIsCreateSubcategoryOpen(true);
                return;
            }
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
        }
    };
    
    const handleCreateCategory = async (newCategory: string) => {
        const res = await api.addInventoryCategory(newCategory);
        if (res.success) {
            if(user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Create Inventory Category', `Created category: ${newCategory}`);
            }
            setCategories(res.data);
            setFormData(prev => ({...prev, category: newCategory, subcategory: ''}));
        }
    };

    const handleCreateSubcategory = async (newSubcategory: string) => {
        if (!formData.category) return;
        const res = await api.addInventorySubcategory(formData.category, newSubcategory);
        if (res.success) {
            if(user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Create Inventory Sub-category', `Created sub-category: ${newSubcategory} under ${formData.category}`);
            }
            setCategories(res.data);
            setFormData(prev => ({...prev, subcategory: newSubcategory}));
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.category) return alert('Name and Category are required.');
        if(user) {
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            const action = item ? 'Edit Inventory Item' : 'Add Inventory Item';
            const details = `${item ? 'Edited' : 'Added'} item: ${formData.name}`;
            api.logAction(userName, action, details);
        }
        onSave(formData as InventoryItem);
    };
    
    const subcategoryOptions = React.useMemo(() => {
        if (!formData.category) return [];
        const selectedCat = categories.find(c => c.name === formData.category);
        return selectedCat ? selectedCat.subcategories : [];
    }, [formData.category, categories]);

    const isClothingCategory = formData.category === 'Uniform';
    const inputStyles = "mt-1 w-full p-2 bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <>
            <Modal show={isOpen} onClose={onClose} title={item ? 'Edit Item' : 'Add New Item'}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Item Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Category</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} className={inputStyles}>
                                <option value="" disabled>Select a category...</option>
                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                <option value="--create--">Create new category...</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Sub-category</label>
                            <select name="subcategory" value={formData.subcategory || ''} onChange={handleChange} className={inputStyles} disabled={!formData.category}>
                                <option value="" disabled>Select a sub-category...</option>
                                {subcategoryOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="--create--">Create new sub-category...</option>
                            </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Size (Optional)</label>
                            <input type="text" name="size" value={formData.size || ''} onChange={handleChange} className={inputStyles} />
                        </div>
                        {isClothingCategory && (
                             <div>
                                <label className="block text-sm font-medium">Gender</label>
                                <select name="gender" value={formData.gender || 'Unisex'} onChange={handleChange} className={inputStyles}>
                                    <option value="Unisex">Unisex</option>
                                    <option value="Boys">Boys'</option>
                                    <option value="Girls">Girls'</option>
                                </select>
                            </div>
                        )}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity || 0} onChange={handleChange} className={inputStyles} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Minimum Stock</label>
                            <input type="number" name="minStock" value={formData.minStock || 0} onChange={handleChange} className={inputStyles} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium">Storage Location</label>
                        <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Notes</label>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={inputStyles} />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Item</Button>
                </div>
            </Modal>
            <CreateCategoryModal
                isOpen={isCreateCategoryOpen}
                onClose={() => setIsCreateCategoryOpen(false)}
                onSave={handleCreateCategory}
                title="Create New Category"
                label="Category Name"
            />
            <CreateCategoryModal
                isOpen={isCreateSubcategoryOpen}
                onClose={() => setIsCreateSubcategoryOpen(false)}
                onSave={handleCreateSubcategory}
                title={`Add Sub-category to "${formData.category}"`}
                label="Sub-category Name"
            />
        </>
    );
};

export default InventoryItemModal;
