import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  options: string[];
  onSave: (selectedValue: string) => void;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ isOpen, onClose, title, label, options, onSave }) => {
  const [selectedValue, setSelectedValue] = React.useState('');

  React.useEffect(() => {
    if (isOpen && options.length > 0) {
      setSelectedValue(options[0]);
    } else {
      setSelectedValue('');
    }
  }, [isOpen, options]);

  const handleSave = () => {
    if (selectedValue) {
      onSave(selectedValue);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} title={title} size="sm">
      <div>
        <label className="block text-sm font-medium text-text-muted">{label}</label>
        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          className="mt-1 w-full p-2 bg-gray-base border border-gray-border rounded-md focus:ring-primary focus:border-primary"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Apply Changes</Button>
      </div>
    </Modal>
  );
};

export default BulkUpdateModal;
