import React from 'react';
import {
  FormControl, Box, MenuItem, OutlinedInput
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import CheckBox from '../checkbox/index';

import SelectWrapper from './style';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 110
    }
  }
};

const MultipleSelectCheckMarks = (props) => {
  const {
    width, label, vertical, values = [], value = [],
    name: inputFieldName, onChange, checkedList, placeholder = []
  } = props;

  const handleChange = (event) => {
    onChange(event);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: vertical ? '' : 'column' }} alignItems={vertical ? 'center' : 'flex-start'}>
      {label && <Box component="label" marginRight={vertical ? 0.5 : 0} marginBottom={vertical ? 0 : ''}>{label}</Box>}
      <FormControl sx={{ width: width || '100%' }}>
        <SelectWrapper
          multiple
          name={inputFieldName}
          value={value}
          onChange={handleChange}
          displayEmpty
          renderValue={(value) => (value?.length ? Array.isArray(value) ? value.join(', ') : value : placeholder)}
          input={<OutlinedInput />}
          IconComponent={KeyboardArrowDownIcon}
          MenuProps={MenuProps}
          size="small"
        >
          {values?.map((name) => (
            <MenuItem key={name} value={name}>
              <CheckBox
                padding="0 8px 0 0"
                marginBottom="0"
                margin
                checked={checkedList?.indexOf(name) > -1}
              />
              <Box sx={{ color: '#272B41', fontSize: '13px' }}>{name}</Box>
            </MenuItem>
          ))}
        </SelectWrapper>
      </FormControl>
    </Box>
  );
};

export default MultipleSelectCheckMarks;
