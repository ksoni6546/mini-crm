import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = idCounter++;
    setToasts(prev => [...prev, { id, type, message }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast('success', msg, duration), [addToast]);
  const error = useCallback((msg, duration) => addToast('error', msg, duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast('warning', msg, duration), [addToast]);
  const info = useCallback((msg, duration) => addToast('info', msg, duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in-right`}>
            <div className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '🚨'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
            <div className="toast-progress-bar" style={{ animationDuration: `${4000}ms` }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
