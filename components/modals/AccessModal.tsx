// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Button from '../ui/Button';

interface AccessModalProps {
  onLogin: (code: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const AccessModal: React.FC<AccessModalProps> = ({ onLogin, error, isLoading }) => {
  const [code, setCode] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      await onLogin(code);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-surface rounded-lg shadow-xl p-8 border border-gray-border">
        <div className="text-center mb-6">
          <img src="https://img.icons8.com/ios-filled/50/38bdf8/shield.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-text-main">Fa Nyame Admin</h1>
          <p className="text-text-muted text-sm mt-1">Enter access code to continue.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="accessCode" className="block text-sm font-medium text-text-muted mb-1">Access Code</label>
              <input
                type="password"
                id="accessCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-base border border-gray-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••"
                autoFocus
              />
              <p className="text-xs text-text-subtle mt-1">Hint: 1234 (Director), 5678 (Leader), 9999 (Counsellor)</p>
            </div>
          
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !code}>
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AccessModal;