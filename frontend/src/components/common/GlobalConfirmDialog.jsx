import React from 'react';
import { createPortal } from 'react-dom';
import { ConfirmDialog } from '../../admin/components/common/ConfirmDialog';
import { useConfirmStore } from '../../store/useConfirmStore';

// Drawn on <body> after every drawer and modal, so it always shows on top of them
export const GlobalConfirmDialog = () => {
  const request = useConfirmStore((state) => state.request);
  const close = useConfirmStore((state) => state.close);

  return createPortal(
    <ConfirmDialog
      isOpen={!!request}
      title={request?.title}
      message={request?.message}
      confirmText={request?.confirmText || 'Yes, Delete'}
      onConfirm={() => request?.onConfirm?.()}
      onClose={close}
    />,
    document.body
  );
};
