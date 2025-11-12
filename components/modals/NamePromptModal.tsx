import * as React from 'react';
import Button from '../ui/Button';

interface NamePromptModalProps {
  onContinue: (name: string) => void;
}

const NamePromptModal: React.FC<NamePromptModalProps> = ({ onContinue }) => {
  const [name, setName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
        onContinue(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-surface rounded-lg shadow-xl p-8 border border-gray-border">
        <div className="text-center mb-6">
          <img src="https://img.icons8.com/ios-filled/50/38bdf8/shield.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-text-main">Identify Yourself</h1>
          <p className="text-text-muted text-sm mt-1">Please enter your name to continue.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="individualName" className="block text-sm font-medium text-text-muted mb-1">Your Name</label>
              <input
                type="text"
                id="individualName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-base border border-gray-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="E.g., Carl"
                autoFocus
              />
              <p className="text-xs text-text-subtle mt-1">This name will be used for logging your actions.</p>
            </div>
          
          <Button type="submit" variant="primary" className="w-full" disabled={!name.trim()}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NamePromptModal;