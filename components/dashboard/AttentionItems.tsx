import * as React from 'react';
import { Notification } from '../../types';
import { DollarSign, UserX, TrendingDown, BookOpen, Archive, AlertTriangle } from 'react-feather';

interface AttentionItemsProps {
  items: {
    id: string;
    type: Notification['type'];
    message: string;
  }[];
}

const itemIcons: Record<Notification['type'], React.ReactElement> = {
    overdue_fee: <DollarSign size={16} className="text-danger" />,
    incomplete_registration: <UserX size={16} className="text-amber-400" />,
    low_attendance: <TrendingDown size={16} className="text-amber-400" />,
    missing_item: <BookOpen size={16} className="text-primary" />,
    low_stock: <Archive size={16} className="text-warning" />,
};

const AttentionItems: React.FC<AttentionItemsProps> = ({ items }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-text-muted">No attention items at the moment. Everything looks good!</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm p-2 bg-gray-base rounded">
                    <div className="flex-shrink-0">
                        {itemIcons[item.type] || <AlertTriangle size={16} />}
                    </div>
                    <span className="text-text-muted">{item.message}</span>
                </div>
            ))}
        </div>
    );
};

export default AttentionItems;