import React from 'react';
import { Tooltip, Zoom } from '@mui/material';

const Index = (props) => {
  const { image, children, onError } = props;
  const transitionProps = {
    timeout: 500,
    style: {
      transformOrigin: 'center left'
    }
  };

  return (
    <Tooltip
      placement="right"
      TransitionComponent={Zoom}
      TransitionProps={transitionProps}
      classes={{ popper: 'custom-tooltip onImage' }}
      title={(
        <img
          width={220}
          height={220}
          src={image}
          alt=""
          onError={onError}
        />
          )}
    >
      {children}
    </Tooltip>
  );
};

export default Index;
