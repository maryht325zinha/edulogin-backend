
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: { backgroundColor: 'var(--color-success)' },
    error: { backgroundColor: 'var(--color-danger)' },
    info: { backgroundColor: 'var(--color-secondary)' }
  };

  return (
    <div
      className="card animate-fade-in"
      style={{
        ...styles[toast.type],
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
