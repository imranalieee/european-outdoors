import React, { useState } from 'react';
import PasswordStrengthBar from 'react-password-strength-bar';
import { TextField } from '@mui/material';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';

import { InputWrapper } from '../style';

const Index = (props) => {
  const {
    label, inputStatus, inputInfo, status, placeholder, strength, className
  } = props;
  const [inputValue, setInputValue] = useState('');
  const [passwordShow, setPasswordShow] = useState(false);
  return (
    <InputWrapper className={`password-input ${className}`}>
      <div className="position-relative ">
        <TextField
          fullWidth
          type={passwordShow ? 'text' : 'password'}
          value={inputValue}
          placeholder={placeholder}
          label={label}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />

        {passwordShow ? (
          <BsFillEyeFill
            className="password-icon"
            onClick={() => setPasswordShow(false)}
          />
        ) : (
          <BsFillEyeSlashFill
            className="password-icon"
            onClick={() => setPasswordShow(true)}
          />
        )}
      </div>
      <div className="input-extras">
        {inputStatus && (
        <span className={`text-status text-${status} danger-border`}>{inputStatus}</span>
        )}
        {inputInfo && <span className="text-info">{inputInfo}</span>}
        {strength && (
        <span className="d-flex password-meter">
          <label>Strength</label>
          <PasswordStrengthBar
            className="password-strength"
            password={inputValue}
            minLength={5}
          />
        </span>
        )}
      </div>
    </InputWrapper>
  );
};

export default Index;
