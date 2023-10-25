import React from 'react';
import {
  MenuItem,
  FormHelperText,
  FormControl,
  Box
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// styles
import SelectWrapper from './style';

const Index = (props) => {
  const {
    label,
    status,
    placeholder,
    width,
    menuItem,
    handleChange,
    value,
    defaultValue,
    name,
    disabled,
    exportButton,
    border,
    vertical,
    helperText
  } = props;
  return (
    <Box sx={{ display: 'flex', flexDirection: vertical ? '' : 'column' }} alignItems={vertical ? 'center' : 'flex-start'}>
      {label && <Box component="label" marginRight={vertical ? 0.5 : 0} marginBottom={vertical ? 0 : ''}>{label}</Box>}
      <FormControl sx={{ minWidth: width || '100%' }}>
        <SelectWrapper
          id={value}
          value={value}
          defaultValue={defaultValue}
          displayEmpty
          onChange={handleChange}
          size="small"
          name={name}
          disabled={disabled}
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            '.MuiOutlinedInput-notchedOutline': { border: border === 'none' ? 0 : '' },
            padding: exportButton ? '5px 1px 5px 21px' : ''
          }}
        >
          <MenuItem value="" disabled>
            <Box
              component="span"
              sx={{
                color: exportButton ? '#3C76FF' : '',
                fontWeight: exportButton ? '600' : ''
              }}
            >
              {placeholder}

            </Box>
          </MenuItem>
          {menuItem?.map((items, index) => (
            <MenuItem key={index} value={items?.value ? items?.value : items}>
              {items?.label ? items?.label : items}
            </MenuItem>
          ))}
        </SelectWrapper>
        {status && <FormHelperText>{status}</FormHelperText>}
        {helperText && (
          <FormHelperText sx={{
            marginLeft: '0',
            position: 'absolute',
            letterSpacing: '0',
            bottom: '-18px',
            color: 'rgb(220 70 83)',
            fontSize: '10px'
          }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default Index;
