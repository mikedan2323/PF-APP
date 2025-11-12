// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { UniformRecord } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface UniformDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: UniformRecord;
    uniformData: { items: string[], sizeItems: string[] };
    onItemChange: (memberName: string, item: string, value: boolean) => void;
    onSizeChange: (memberName: string, item: string, size: string) => void;
}

const UniformDetailModal: React.FC<UniformDetailModalProps> = ({ isOpen, onClose, member, uniformData, onItemChange, onSizeChange }) => {

    const selectStyles = "mt-2 block w-full text-sm rounded-md bg-gray-input border-gray-border shadow-sm focus:border-primary focus:ring-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title={`${member.name}'s Uniform`} size="lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {uniformData.items.map(item => {
                    const hasItem = member.items[item];
                    const needsSize = uniformData.sizeItems.includes(item);

                    return (
                        <div key={item} className="p-4 border border-gray-border rounded-lg">
                            <label className="flex items-center justify-between font-medium">
                                {item}
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary"
                                    checked={hasItem}
                                    onChange={(e) => onItemChange(member.name, item, e.target.checked)}
                                />
                            </label>
                            {needsSize && (
                                <select
                                    value={member.sizes[item] || ''}
                                    onChange={(e) => onSizeChange(member.name, item, e.target.value)}
                                    className={selectStyles}
                                >
                                    <option value="">Size...</option>
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}
                        </div>
                    );
                })}
            </div>
             <div className="mt-8 flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default UniformDetailModal;