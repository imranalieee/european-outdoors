import * as React from 'react';
import Drawer from '@mui/material/Drawer';

const Index = (props) => {
  const {
    open, close, children, width
  } = props;
  return (
    <Drawer
      onBackdropClick={close}
      anchor="right"
      open={open}
      onClose={close}
      PaperProps={{
        sx: { width, padding: '24px', boxSizing: 'border-box' }
      }}
    >
      {children}
    </Drawer>
  );
};
export default Index;
