import React from 'react';
import { Box } from '@mui/material';
import { PopoverWrapper } from './style';

const Index = (props) => {
  const {
    id,
    open,
    anchorEl,
    onClose,
    children,
    className,
    title,
    onMouseLeave,
    onMouseEnter
  } = props;
  return (
    <PopoverWrapper
      className={className}
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableRestoreFocus
      sx={{
        pointerEvents: 'none'
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <Box
        className="popover-content-custom"
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        sx={{
          pointerEvents: 'auto'
        }}
      >
        {title && <h3 className="popover-title">{title}</h3>}
        {children}
      </Box>
    </PopoverWrapper>
  );
};

export default Index;
