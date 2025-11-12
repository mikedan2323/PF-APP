import { InventoryItem } from '../../types';

export const MOCK_INVENTORY_CATEGORIES: { name: string, subcategories: string[] }[] = [
    { name: 'Uniform', subcategories: ['Type A', 'Type B', 'Accessories'] },
    { name: 'Crafts', subcategories: ['Paper Goods', 'Adhesives', 'General'] },
    { name: 'Camping Gear', subcategories: ['Shelter', 'Cooking', 'Safety'] },
    { name: 'Admin', subcategories: [] },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv1', name: 'Sash', category: 'Uniform', subcategory: 'Accessories', quantity: 3, minStock: 5, size: 'M' },
    { id: 'inv2', name: 'Scarf', category: 'Uniform', subcategory: 'Accessories', quantity: 15, minStock: 10 },
    { id: 'inv3', name: 'Construction Paper', category: 'Crafts', subcategory: 'Paper Goods', quantity: 50, minStock: 20 },
    { id: 'inv4', name: 'Tent', category: 'Camping Gear', subcategory: 'Shelter', quantity: 4, minStock: 2, location: 'Storage Closet' },
    { id: 'inv5', name: 'Shirt (Type A)', category: 'Uniform', subcategory: 'Type A', quantity: 12, minStock: 10, size: 'L' },
];