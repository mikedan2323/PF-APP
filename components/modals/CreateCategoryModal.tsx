import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  title: string;
  label: string;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose, onSave, title, label }) => {
  const [name, setName] = React.useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  return (
    <Modal show={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted">{label}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary"
            autoFocus
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>Create</Button>
      </div>
    </Modal>
  );
};

export default CreateCategoryModal;
