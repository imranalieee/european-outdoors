import React, { useState } from 'react';
import {
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  Stack,
  Box
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// style
// images
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import CheckImage from '../../../static/images/check.svg';
import { InputWrapper } from '../style';

const Index = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const {
    label,
    placeholder,
    onChange,
    value,
    width,
    height,
    CheckIcon,
    helperText,
    name,
    minValue,
    marginBottom,
    type,
    disabled,
    multiline,
    maxRows,
    align,
    inputRef,
    defaultValue,
    className,
    onNext,
    onPrev,
    rows,
    showIcon,
    range,
    background,
    msgColor,
    isError,
    labelWeight,
    autoComplete,
    key,
    onKeyDown
  } = props;
  return (
    <InputWrapper height={height} marginBottom={marginBottom} background={background} align={align}>
      <FormControl sx={{ width }} key={key}>
        {label && <label style={{ fontWeight: `${labelWeight}` }}>{label}</label>}
        <OutlinedInput
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          inputProps={{ min: minValue }}
          disabled={disabled}
          id={name}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          className={`outlined-input ${className}`}
          value={value}
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          error={!!helperText && isError}
          multiline={multiline}
          defaultValue={defaultValue}
          maxRows={maxRows}
          rows={rows}
          inputRef={inputRef}
          showIcon={showIcon}
          sx={{
            '&.MuiOutlinedInput-root:hover': {
              border: 'none'
            }
          }}
          endAdornment={
            showIcon && type === 'password' ? (
              <InputAdornment className="password-icon-box" position="end">
                {showPassword ? (
                  <AiFillEyeInvisible
                    onClick={handleTogglePasswordVisibility}
                  />
                ) : (
                  <AiFillEye onClick={handleTogglePasswordVisibility} />
                )}
              </InputAdornment>
            ) : CheckIcon ? (
              <InputAdornment position="end" sx={{ marginRight: '12px' }}>
                <img src={CheckImage} alt="no-icon" />
              </InputAdornment>
            ) : type === 'number' ? (
              <InputAdornment position="end">
                <Stack height="23px" padding="0px 11px" zIndex={999}>
                  <KeyboardArrowUpIcon
                    onClick={onNext}
                    sx={{
                      color: '#3C76FF',
                      fontSize: '13px',
                      marginTop: '0',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  />
                  <KeyboardArrowDownIcon
                    onClick={onPrev}
                    sx={{
                      color: '#3C76FF',
                      fontSize: '13px',
                      marginTop: '-5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  />
                </Stack>
              </InputAdornment>
            ) : range ? (
              <InputAdornment position="end">
                <Stack height="23px" padding="0px 11px" zIndex={999} justifyContent="center">
                  <Box
                    component="span"
                    sx={{
                      color: '#3C76FF',
                      fontSize: '16px',
                      marginTop: '0',
                      cursor: 'pointer',
                      fontWeight: '400'
                    }}
                  >
                    $
                  </Box>
                </Stack>
              </InputAdornment>
            ) : null
          }
        />
        {helperText && (
          <FormHelperText className={`helper-text text-${msgColor || 'danger'}`}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </InputWrapper>
  );
};

export default Index;
