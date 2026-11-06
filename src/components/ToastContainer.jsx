import React from 'react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const iconClass = isSuccess ? 'fa-check-circle text-green-400' : 'fa-info-circle text-yellow-400';

        return (
          <div key={toast.id} className="toast">
            <i className={`fas ${iconClass}`}></i>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

