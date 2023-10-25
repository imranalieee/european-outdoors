import React from 'react';
import Dialog from '@mui/material/Dialog';
import LoaderWrapper from '../loader';

const Modal = (props) => {
  const {
    show, children, onClose, width, fullWidth, loading
  } = props;

  return (
    <Dialog
      open={show}
      fullWidth={fullWidth}
      maxWidth={width}
      onClose={onClose}
      sx={{ padding: '24px 38px', minWidth: 362 }}
    >
      { loading
        ? <LoaderWrapper />
        : null}
      {children}
    </Dialog>
  );
};

export default Modal;
