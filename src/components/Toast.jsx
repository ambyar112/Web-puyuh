import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

let toastCallback = null;

export function setToastCallback(fn) {
  toastCallback = fn;
}

export function showToast(message, type = 'info') {
  if (toastCallback) toastCallback(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Register callback
  useState(() => {
    setToastCallback(addToast);
  });

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{icons[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
