// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Group } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: { name: string; color: string }) => void;
  group: Group | null;
  onDelete?: () => void;
  isDefault?: boolean;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSave, group, onDelete, isDefault }) => {
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#808080');

  React.useEffect(() => {
    if (isOpen) {
      if (group) {
        setName(group.name);
        setColor(group.color);
      } else {
        setName('');
        setColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
      }
    }
  }, [isOpen, group]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), color });
    }
  };

  const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";

  return (
    <Modal 
      show={isOpen} 
      onClose={onClose} 
      title={group ? 'Edit Group' : 'Add New Group'} 
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
            {group && onDelete && (
                <Button 
                    variant="danger" 
                    onClick={onDelete} 
                    className="mr-auto"
                >
                    Delete
                </Button>
            )}
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyles}
            placeholder="e.g., Peacocks"
            disabled={isDefault}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted">Group Color</label>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 p-1 bg-gray-base border border-gray-border rounded-md cursor-pointer"
            />
            <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                className={inputStyles}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GroupModal;