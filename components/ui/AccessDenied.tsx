import * as React from 'react';
import { Lock } from 'react-feather';
import Card from './Card';

const AccessDenied: React.FC = () => {
  return (
    <Card>
      <div className="text-center p-16">
        <Lock className="w-16 h-16 text-danger mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-main">Access Denied</h2>
        <p className="text-text-muted mt-2">You do not have the necessary permissions to view this page.</p>
        <p className="text-sm text-text-subtle mt-1">Please contact an administrator if you believe this is an error.</p>
      </div>
    </Card>
  );
};

export default AccessDenied;