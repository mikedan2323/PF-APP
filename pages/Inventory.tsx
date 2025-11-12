// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { InventoryItem } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/ui/StatCard';
import InventoryItemModal from '../components/modals/InventoryItemModal';
import { useAlert, useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';

const Inventory: React.FC = () => {
    const user = useUser();
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
    const [categories, setCategories] = React.useState<{ name: string; subcategories: string[] }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
    const { addAlert } = useAlert();
    
    // Filters
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [subcategoryFilter, setSubcategoryFilter] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const fetchData = async () => {
        setLoading(true);
        const response = await api.getInventoryData();
        if (response.success) {
            setInventory(response.data.items);
            setCategories(response.data.categories);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleQuantityChange = (id: string, currentQuantity: number) => {
        const newQuantity = prompt("Enter new quantity:", currentQuantity.toString());
        if (newQuantity !== null && !isNaN(parseInt(newQuantity))) {
            const newQty = parseInt(newQuantity);
            api.updateInventoryQuantity(id, newQty);
            setInventory(prev => prev.map(item => item.id === id ? {...item, quantity: newQty} : item));
            addAlert('Quantity updated.', 'success');
            const item = inventory.find(i => i.id === id);
            if (item && user) {
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                api.logAction(userName, 'Update Inventory', `Updated quantity for ${item.name} from ${currentQuantity} to ${newQty}`);
            }
        }
    };
    
    const handleOpenModal = (item: InventoryItem | null = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    
    const getStatus = (item: InventoryItem) => {
        if (item.quantity <= 0) return 'Out of Stock';
        if (item.quantity <= item.minStock) return 'Low Stock';
        return 'In Stock';
    }

    const subcategoryOptions = React.useMemo(() => {
        if (categoryFilter === 'all') return [];
        const selectedCat = categories.find(c => c.name === categoryFilter);
        return selectedCat ? selectedCat.subcategories : [];
    }, [categoryFilter, categories]);

    React.useEffect(() => {
        setSubcategoryFilter('all');
    }, [categoryFilter]);

    const filteredInventory = React.useMemo(() => {
        return inventory.filter(item => {
            const status = getStatus(item);
            return (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (categoryFilter === 'all' || item.category === categoryFilter) &&
                (subcategoryFilter === 'all' || item.subcategory === subcategoryFilter) &&
                (statusFilter === 'all' || status === statusFilter)
            );
        });
    }, [inventory, searchTerm, categoryFilter, subcategoryFilter, statusFilter]);
    
    const inventoryStats = React.useMemo(() => {
        const totalUniqueItems = inventory.length;
        const totalItemCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= item.minStock).length;
        const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
        return { totalUniqueItems, totalItemCount, lowStockItems, outOfStockItems };
    }, [inventory]);

    const handleExportCSV = () => {
        if (!user) return;

        const headers = [
            "Item Name", "Category", "Sub-category", "Size",
            "Quantity", "Min. Stock", "Location", "Notes", "Status"
        ];

        const escapeCSV = (field: any) => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = filteredInventory.map(item => {
            const status = getStatus(item);
            return [
                escapeCSV(item.name),
                escapeCSV(item.category),
                escapeCSV(item.subcategory),
                escapeCSV(item.size),
                escapeCSV(item.quantity),
                escapeCSV(item.minStock),
                escapeCSV(item.location),
                escapeCSV(item.notes),
                escapeCSV(status)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory_export_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        api.logAction(userName, 'Export Data', 'Exported inventory data to CSV.');
        addAlert('Inventory data exported to CSV.', 'success');
    };

    if (loading || !user) return <Spinner show={true} />;

    if (!user.permissions.inventory.view) {
        return <AccessDenied />;
    }
    
    const inputStyles = "w-full px-3 py-2 bg-gray-input border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted";

    return (
        <>
         <div className="space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard label="Total Unique Items" value={inventoryStats.totalUniqueItems} />
                <StatCard label="Total Item Count" value={inventoryStats.totalItemCount} />
                <StatCard 
                    label="Items on Low Stock" 
                    value={inventoryStats.lowStockItems}
                    className={inventoryStats.lowStockItems > 0 ? 'bg-warning/10 !border-warning/30' : ''}
                />
                <StatCard 
                    label="Items Out of Stock" 
                    value={inventoryStats.outOfStockItems}
                    className={inventoryStats.outOfStockItems > 0 ? 'bg-danger/10 !border-danger/30' : ''}
                />
            </div>
             <Card title="Inventory Management" actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV}>Export to CSV</Button>
                    <Button onClick={() => handleOpenModal()}>Add Item</Button>
                </div>
                }>
                <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-3">
                     <input
                        type="text" placeholder="Search by item name..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputStyles}
                    />
                     <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={inputStyles}>
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                     <select value={subcategoryFilter} onChange={e => setSubcategoryFilter(e.target.value)} className={inputStyles} disabled={categoryFilter === 'all'}>
                        <option value="all">All Sub-categories</option>
                        {subcategoryOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputStyles}>
                        <option value="all">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>
                 <div className="overflow-x-auto -mx-4 md:-mx-6">
                    <table className="w-full text-sm">
                        <thead className="text-left bg-gray-base">
                            <tr>
                                {['Item', 'Category', 'Sub-category', 'Size', 'Gender', 'Qty', 'Min.', 'Location', 'Status', 'Actions'].map(h => 
                                    <th key={h} className="p-3 font-medium text-text-muted">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => {
                                const status = getStatus(item);
                                return (
                                <tr key={item.id} className="border-b border-gray-border">
                                    <td className="p-3 font-bold text-text-main">{item.name}</td>
                                    <td className="p-3 text-text-muted">{item.category}</td>
                                    <td className="p-3 text-text-muted">{item.subcategory || '-'}</td>
                                    <td className="p-3 text-text-muted">{item.size || '-'}</td>
                                    <td className="p-3 text-text-muted">{item.gender === 'Unisex' ? '-' : item.gender || '-'}</td>
                                    <td className="p-3 text-text-muted font-semibold cursor-pointer" onClick={() => handleQuantityChange(item.id, item.quantity)}>{item.quantity}</td>
                                    <td className="p-3 text-text-muted">{item.minStock}</td>
                                    <td className="p-3 text-text-muted">{item.location || '-'}</td>
                                    <td className="p-3">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                             status === 'Out of Stock' ? 'bg-danger/20 text-red-300' : 
                                             status === 'Low Stock' ? 'bg-warning/20 text-amber-300' : 'bg-success/20 text-green-300'
                                         }`}>{status}</span>
                                    </td>
                                    <td className="p-3">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(item)}>Edit</Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                 {inventory.length === 0 && !loading && (
                    <div className="text-center py-12 text-text-muted">
                        <h3 className="text-lg font-medium">No inventory items</h3>
                        <p>Click "Add Item" to start tracking inventory.</p>
                    </div>
                )}
            </Card>
         </div>
         <InventoryItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            item={selectedItem}
            onSave={() => {
                fetchData();
                addAlert(selectedItem ? 'Item updated!' : 'Item added!', 'success');
                setIsModalOpen(false);
            }}
         />
        </>
    );
};

export default Inventory;
