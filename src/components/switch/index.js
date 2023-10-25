import React, { useState } from 'react';

import { FormControlLabel, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';

import SwitchWrapper from './style';

const Android12Switch = styled(Switch)((props) => ({
  width: props.width,
  height: props.height || 29,
  padding: props.padding || 6,
  position: 'relative',
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    border: '2px solid #ccc',
    backgroundColor: 'transparent',
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16
    }
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: props.thumdWidth || 14,
    height: props.thumdHeight || 14,
    margin: props.margin || -2
  }
}));

export default function CustomizedSwitches(props) {
  const {
    checked, onChange, offText, onText, content, width, thumbColor, danger,
    disabled, name, height, thumdWidth, thumdHeight, margin,
    largeSwitch, translate, rightSpacing, leftSpacing, padding
  } = props;
  return (
    <SwitchWrapper
      left="31px"
      right="31px"
      offText={offText}
      onText={onText}
      content={content}
      thumbColor={thumbColor}
      danger={danger}
      largeSwitch={largeSwitch}
      translate={translate}
      rightSpacing={rightSpacing}
      leftSpacing={leftSpacing}
    >
      <FormControlLabel
        name={name}
        control={(
          <Android12Switch
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            width={width || 72}
            padding={padding}
            height={height || 29}
            thumdWidth={thumdWidth}
            thumdHeight={thumdHeight}
            margin={margin}
          />
        )}
      />
    </SwitchWrapper>
  );
}
