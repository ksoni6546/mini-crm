import React from 'react';
import { useToast } from '../contexts/ToastContext';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState({
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true,
    confirmText: 'Confirm'
  });

  const confirm = ({ title, message, onConfirm, isDanger = true, confirmText = 'Confirm' }) => {
    setConfirmConfig({ title, message, onConfirm, isDanger, confirmText });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return { isOpen, confirm, close, confirmConfig };
};
