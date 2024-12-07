
import React, { useState, useEffect, useRef, useCallback } from "react";

export const showNotification = (message, timeAgo = 'just now') => {
    const event = new CustomEvent('showNotification', { 
        detail: { message, timeAgo } 
    });
    window.dispatchEvent(event);
};

function NotificationCenter(){
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Listen for notification requests
        const handleShowToast = (event) => {
            const { message, timeAgo } = event.detail;
            const currentTime = Date.now();
            const newToast = {
                message,
                timeAgo,
                id: currentTime,
                opacity: 1
            };

            setToasts(prevToasts => [
                ...prevToasts.filter(toast => currentTime - toast.id < 5000),
                newToast
            ]);

            setTimeout(() => {
                setToasts(prevToasts =>
                    prevToasts.map(toast =>
                        toast.id === newToast.id ? { ...toast, opacity: 0 } : toast
                    )
                );
            }, 4000);

            setTimeout(() => {
                setToasts(prevToasts => 
                    prevToasts.filter(toast => toast.id !== newToast.id)
                );
            }, 5000);
        };

        window.addEventListener('showNotification', handleShowToast);
        return () => window.removeEventListener('showNotification', handleShowToast);
    }, []);
    
    return (
        <div className="fixed top-5 right-4 z-500 flex flex-col gap-3" style={{ 
            minWidth: '350px',
         }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="bg-white rounded-lg shadow-lg border border-gray-100 transform transition-all duration-500 ease-in-out"
            style={{
              opacity: toast.opacity,
              transform: `translateX(${(1 - toast.opacity) * 100}px)`,
            }}
            role="alert"
          >
            <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-gray-800">Notification</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{toast.timeAgo}</span>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 text-gray-700">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    )
}

export default NotificationCenter;
