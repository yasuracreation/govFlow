import React from 'react';

interface CustomAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  message: string;
  show?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const typeStyles = {
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  confirm: 'bg-blue-50 text-blue-900 border-blue-300',
};

const iconMap = {
  success: (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  error: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
  ),
  info: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
  ),
  confirm: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
  ),
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  type = 'info',
  message,
  show = true,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  if (!show) return null;
  return (
    <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 border px-6 py-4 rounded shadow-lg min-w-[320px] max-w-[90vw] ${typeStyles[type]}`}>
      <div className="flex items-start space-x-3">
        <div className="pt-1">{iconMap[type]}</div>
        <div className="flex-1">
          <span className="block text-base font-medium mb-1">{message}</span>
          {type === 'confirm' && (
            <div className="mt-3 flex space-x-2">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 focus:outline-none"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-lg font-bold text-gray-500 hover:text-gray-700">&times;</button>
        )}
      </div>
    </div>
  );
};

export default CustomAlert; 