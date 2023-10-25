import * as React from 'react';

import { Checkbox, FormGroup, FormControlLabel } from '@mui/material';
// styles
import { styled } from '@mui/material/styles';
import CheckBoxWrapper from './style';

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: 1,
  width: 12,
  height: 12,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 0 0 1px rgb(16 22 26 / 40%)'
      : 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: 'transparent',
  backgroundImage:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
      : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background:
      theme.palette.mode === 'dark' ? 'rgba(57,75,89,.5)' : 'rgba(206,217,224,.5)'
  },
  marginLeft: '2px'
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: '#3C76FF',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    display: 'block',
    width: 12,
    height: 12,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath"
      + " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 "
      + "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""'
  },
  'input:hover ~ &': {
    backgroundColor: '#3C76FF'
  }
});
export default function CustomizedCheckbox(props) {
  const {
    label, marginBottom, className, disabled, checked, margin, padding
  } = props;

  return (
    <CheckBoxWrapper marginBottom={marginBottom} padding={padding}>
      <FormGroup className={`checkbox-label ${className || ''}`}>
        <FormControlLabel
          sx={{ margin: margin ? 0 : '' }}
          control={(
            <Checkbox
              sx={{
                '&:hover': { bgcolor: 'transparent' }
              }}
              disabled={disabled}
              checked={checked}
              disableRipple
              color="default"
              checkedIcon={<BpCheckedIcon />}
              icon={<BpIcon />}
              inputProps={{ 'aria-label': 'Checkbox demo' }}
              {...props}
            />
          )}
          label={label}
        />
      </FormGroup>
    </CheckBoxWrapper>
  );
}
