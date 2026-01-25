import React from 'react';
import Button from './ui/Button';

interface ConfirmationModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isConfirming = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <i className="fa-solid fa-triangle-exclamation text-red-600 dark:text-red-400 text-xl"></i>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-bold text-text-main dark:text-secondary" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-text-light dark:text-gray-400">
                  {children}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex flex-row-reverse space-x-2 space-x-reverse">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirming}
            className="h-10 px-6"
          >
            {isConfirming ? 'Suppression...' : confirmText}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
            className="h-10 px-6"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;