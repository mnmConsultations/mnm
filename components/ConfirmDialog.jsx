'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmDialogContext = createContext(null);

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null,
    onCancel: null,
  });

  const confirm = useCallback(({
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog dialogState={dialogState} />
    </ConfirmDialogContext.Provider>
  );
};

const ConfirmDialog = ({ dialogState }) => {
  if (!dialogState.isOpen) return null;

  const getButtonClass = () => {
    switch (dialogState.type) {
      case 'danger':
        return 'btn-error';
      case 'warning':
        return 'btn-warning';
      case 'info':
        return 'btn-info';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  const getIcon = () => {
    switch (dialogState.type) {
      case 'danger':
        return (
          <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-16 h-16 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-16 h-16 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h3 className="font-bold text-lg mt-4">{dialogState.title}</h3>
          <p className="py-4">{dialogState.message}</p>
        </div>
        <div className="modal-action justify-center">
          <button
            className="btn btn-ghost"
            onClick={dialogState.onCancel}
          >
            {dialogState.cancelText}
          </button>
          <button
            className={`btn ${getButtonClass()}`}
            onClick={dialogState.onConfirm}
          >
            {dialogState.confirmText}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={dialogState.onCancel}>close</button>
      </form>
    </dialog>
  );
};
