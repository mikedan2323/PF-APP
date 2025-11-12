

import * as React from 'react';
import { UniformRecord } from '../../types';
import { uniformData } from '../../pages/Uniform';

interface UniformMemberCardProps {
    record: UniformRecord & { group: string; class: string };
    gender?: 'Male' | 'Female' | 'Other';
    canEdit: boolean;
    onItemChange: (memberId: string, item: string, value: boolean) => void;
    onSizeChange: (memberId: string, item: string, size: string) => void;
}

const UniformMemberCard: React.FC<UniformMemberCardProps> = ({ record, gender, canEdit, onItemChange, onSizeChange }) => {
    
    const selectStyles = "w-full text-xs rounded-md bg-gray-input border-gray-border shadow-sm focus:border-primary focus:ring-primary py-1 px-2";
    
    return (
        <div className="p-4 border border-gray-border rounded-lg bg-gray-base/50">
            <h4 className="font-bold text-text-main">{record.name}</h4>
            <p className="text-xs text-text-muted">{record.group} / {record.class}</p>
            <div className="mt-3 space-y-2">
                {uniformData.items.map(item => {
                     const needsSize = uniformData.sizeItems.includes(item);
                     let displayItem = item;
                     if (item === 'Pants (Type A)' && gender === 'Female') {
                         displayItem = 'Skirt (Type A)';
                     }
                     return (
                        <div key={item} className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                 <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded text-primary focus:ring-primary mr-2"
                                    checked={!!record.items[item]}
                                    onChange={e => onItemChange(record.memberId, item, e.target.checked)}
                                    disabled={!canEdit}
                                />
                                {displayItem}
                            </label>
                            {needsSize && (
                                <div className="w-24">
                                     <select
                                        value={record.sizes[item] || ''}
                                        onChange={(e) => onSizeChange(record.memberId, item, e.target.value)}
                                        className={selectStyles}
                                        disabled={!canEdit}
                                    >
                                        <option value="">Size...</option>
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                     )
                })}
            </div>
        </div>
    );
};

export default UniformMemberCard;