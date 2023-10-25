import React from 'react';
import { styled, Slider } from '@mui/material';

import RangeSlider from './style';

const iOSBoxShadow = '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const marksArray = [
  {
    value: 0
  },
  {
    value: 20
  },
  {
    value: 37
  },
  {
    value: 100
  }
];

const IOSSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#3880ff' : '#3880ff',
  height: 2,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 12,
    width: 12,
    backgroundColor: '#fff',
    boxShadow: iOSBoxShadow,
    '&:focus, &:hover, &.Mui-active': {
      boxShadow:
                '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
      '@media (hover: none)': {
        boxShadow: iOSBoxShadow
      }
    }
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&:before': {
      display: 'none'
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000'
    }
  },
  '& .MuiSlider-track': {
    border: 'none'
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: '#bfbfbf'
  },
  '& .MuiSlider-mark': {
    backgroundColor: '#D9D9D9',
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: 'currentColor'
    }
  }
}));

const CustomizedSlider = (props) => {
  const {
    label,
    marginBottom,
    onChange,
    value,
    name,
    min,
    max,
    marks,
    defaultValue,
    disabled,
    onClick
  } = props;

  return (
    <RangeSlider marginBottom={marginBottom}>
      {label && <label>{label}</label>}
      <IOSSlider
        disabled={disabled}
        onClick={onClick}
        name={name}
        aria-label="ios slider"
        defaultValue={defaultValue}
        marks={marks}
        onChange={onChange}
        valueLabelDisplay="on"
        value={value}
        min={min}
        max={max}
      />
    </RangeSlider>
  );
};

export default CustomizedSlider;
