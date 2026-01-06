import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-5">{message}</p>
        </div>
        <div className="px-6 pb-5 bg-gray-50 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-brand-dark text-white hover:bg-green-800 text-sm font-semibold shadow"
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn .18s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
