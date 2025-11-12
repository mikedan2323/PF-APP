// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';

interface SpinnerProps {
  show: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;