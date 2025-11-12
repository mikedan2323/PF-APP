// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'react-feather';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal show={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger/20 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-danger" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <p className="text-sm text-text-muted">{message}</p>
        </div>
      </div>
       <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button variant="danger" onClick={onConfirm} className="w-full sm:ml-3 sm:w-auto">
            Confirm
        </Button>
        <Button variant="outline" onClick={onClose} className="mt-3 w-full sm:mt-0 sm:w-auto">
            Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;