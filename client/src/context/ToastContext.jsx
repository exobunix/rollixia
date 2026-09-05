import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = addToast;

  return (
    <ToastContext.Provider value={{ addToast, showToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              background: '#0f172a',
              border: `1px solid ${
                toast.type === 'success' ? '#10b981' :
                toast.type === 'error' ? '#f43f5e' : '#6366f1'
              }`,
              color: '#f8fafc',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              minWidth: '280px',
              maxWidth: '420px',
              pointerEvents: 'auto',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#f43f5e" />}
            {toast.type === 'info' && <Info size={20} color="#6366f1" />}
            <span style={{ fontSize: '0.9rem', flex: 1, fontWeight: 500 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
