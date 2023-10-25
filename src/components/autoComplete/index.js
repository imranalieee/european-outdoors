import { isEmpty, lowerCase } from 'lodash';
import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoCompleteWrapper from './style';

export default function ComboBox(props) {
  const {
    placeholder,
    label,
    loading,
    vertical,
    options,
    width,
    onChange,
    name,
    defaultValue,
    value,
    disabled
  } = props;

  const [localOptions, setLocalOptions] = useState([]);

  const handleInputChange = async (event, newInputValue) => {
    if (!isEmpty(newInputValue) && lowerCase(newInputValue) !== 'all') {
      const filterElements = options?.filter(
        (obj) => lowerCase(obj.label)?.includes(lowerCase(newInputValue))
      );
      setLocalOptions(filterElements);
    } else {
      setLocalOptions(options?.slice(0, 300));
    }
  };

  useEffect(() => {
    if (options?.length) {
      setLocalOptions(options?.slice(0, 300));
    } else {
      setLocalOptions([]);
    }
  }, [options]);

  return (
    <Box sx={{ display: 'flex', flexDirection: vertical ? '' : 'column' }} alignItems={vertical ? 'center' : 'flex-start'}>
      {label && <Box component="label" marginRight={vertical ? 0.5 : 0} marginBottom={vertical ? 0 : ''}>{label}</Box>}
      <AutoCompleteWrapper
        disabled={disabled}
        loading={loading}
        name={name}
        options={localOptions}
        loadingText="loading..."
        defaultValue={defaultValue}
        onChange={onChange}
        value={value}
        popupIcon={<KeyboardArrowDownIcon />}
        sx={{ width: width || '100%' }}
        getOptionLabel={(option) => option?.label}
        onInputChange={handleInputChange}
        renderOption={(props, option) => (
          <Box fontSize="13px" component="li" {...props}>
            {option?.label}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            placeholder={placeholder}
            {...params}
            hiddenLabel
            size="small"
          />
        )}
      />
    </Box>
  );
}
