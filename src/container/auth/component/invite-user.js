import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import PasswordStrengthBar from 'react-password-strength-bar';
import { isEmpty } from 'lodash';
import CryptoJS from 'crypto-js';
import Cookies from 'universal-cookie';
// components
import Button from '../../../components/button/button.styled';
import Input from '../../../components/inputs/input/index';
import Checkbox from '../../../components/checkbox/index';

import { RegisterUser, SetAuthState, SetAuthNotifyState } from '../../../redux/slices/auth-slice';

import { ValidatePassword } from '../../../../utils/helpers';

// style
import SignInStyle from '../index';

const cookies = new Cookies();

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    success
  } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [helperNameText, setHelperNameText] = useState('');
  const [helperPasswordText, setHelperPasswordText] = useState('');
  const [helperResetPasswordText, setHelperResetPasswordText] = useState('');
  const [rememberMe, setRememberMeCheckbox] = useState(false);
  const [email, setEmail] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);

  const handleSubmit = () => {
    const passwordError = ValidatePassword({ password });
    setHelperPasswordText(passwordError);

    if (!(name.length)) {
      setHelperNameText('Name is required!');
    } else {
      setHelperNameText('');
    }

    if (isEmpty(resetPassword)) {
      setHelperResetPasswordText('Confirm password is required!');
    } else if (password !== resetPassword) {
      setHelperResetPasswordText('Password Mismatch!');
    } else {
      setHelperResetPasswordText('');
    }

    if (passwordError === '' && (password === resetPassword) && name?.length) {
      dispatch(RegisterUser({ userId, password, name }));
      setPasswordMatch(false);
    }
  };

  const handleRememberMe = (e) => {
    setRememberMeCheckbox(e.target.checked);

    if (e.target.checked) {
      const encodedPassword = CryptoJS.AES.encrypt(password, process.env.HASH).toString();
      cookies.set('email', email, { maxAge: 60 * 60 * 24 });
      cookies.set('password', encodedPassword, { maxAge: 60 * 60 * 24 });
      cookies.set('rememberMe', rememberMe, { maxAge: 60 * 60 * 24 });
    } else {
      cookies.remove('email', { maxAge: 60 * 60 * 24 });
      cookies.remove('password', { maxAge: 60 * 60 * 24 });
      cookies.remove('rememberMe', { maxAge: 60 * 60 * 24 });
    }
  };

  const handleChange = (value, key) => {
    if (key === 'newPassword') {
      setPassword(value);
      let passwordError = '';
      passwordError = ValidatePassword({ password: value });
      setHelperPasswordText(passwordError);
      if (resetPassword) {
        if (resetPassword === value) {
          setPasswordMatch(true);
          setHelperResetPasswordText('');
        } else if (resetPassword !== value) {
          setPasswordMatch(false);
          setHelperResetPasswordText('Password Mismatch');
        }
      }
    } else if (key === 'confirmPassword') {
      setResetPassword(value);
      if (!value.length) {
        setHelperResetPasswordText('Confirm Password is required!');
      } else if (password === value) {
        setHelperResetPasswordText('');
        setPasswordMatch(true);
      } else if (password !== value) {
        setHelperResetPasswordText('Password Mismatch');
        setPasswordMatch(false);
      } else {
        setHelperPasswordText('');
        setHelperResetPasswordText('');
      }
    }
  };

  useEffect(() => {
    if (success) {
      navigate('/auth/sign-in');
    }

    return () => {
      dispatch(SetAuthState({ field: 'success', value: false }));
    };
  }, [success]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    const getToken = query.get('token');

    if (getToken) {
      cookies.set('verifyInviteToken', getToken, { maxAge: 60 * 60 * 24 });
    }

    let inviteToken;
    if (query.get('token') === null) {
      const tokenFromCookies = cookies.get('verifyInviteToken');

      if (tokenFromCookies) {
        inviteToken = tokenFromCookies;
      } else {
        dispatch(SetAuthNotifyState({ type: 'error', message: 'Kindly Verify the Email Address' }));
        return;
      }
    }

    const jwtToken = query.get('token') || inviteToken;
    const decoded = jwtDecode(jwtToken);

    const {
      userId: id,
      name: nameValue, exp,
      email: emailValue
    } = decoded;
    const expirationTime = new Date(exp * 1000);

    if (expirationTime < new Date()) {
      dispatch(SetAuthNotifyState({ type: 'error', message: 'Your link has been expired!' }));
      return;
    }

    setName(nameValue);
    setUserId(id);
    setEmail(emailValue);
  }, []);

  return (
    <SignInStyle copyRight heading="Invited User" caption="Enter Invited User Information">
      <Box className="auth-content-top">
        <Input
          autoComplete="off"
          hiddenLabel
          placeholder="Enter Your Name"
          size="medium"
          label="Name"
          width="100%"
          marginBottom="16px"
          value={name}
          helperText={helperNameText}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value) {
              setHelperNameText('');
            }
          }}
        />
        <Box position="relative">
          <Stack direction="row" spacing={1} position="absolute" right={2} top={3}>
            <PasswordStrengthBar
              password={password}
              minLength={5}
              shortScoreWord=""
              className="password-strength"
            />
          </Stack>

          <Input
            autoComplete="off"
            name="password"
            type="password"
            label="New Password"
            placeholder="Enter password"
            width="100%"
            marginBottom="33px"
            value={password}
            showIcon
            msgColor={helperPasswordText && password ? 'danger' : 'default'}
            helperText={!password
              ? 'Password must contain Capital, small letter, number and symbols'
              : helperPasswordText}
            isError={!!helperPasswordText && password}
            onChange={(e) => {
              handleChange(e.target.value, 'newPassword');
            }}
          />

        </Box>
        <Box position="relative">
          <Stack direction="row" spacing={1} position="absolute" right={2} top={3}>
            <PasswordStrengthBar
              password={resetPassword}
              minLength={5}
              shortScoreWord=""
              className="password-strength"
            />
          </Stack>

          <Input
            autoComplete="off"
            name="password"
            type="password"
            label="Confirm Password"
            placeholder="Enter confirm password"
            width="100%"
            marginBottom="26px"
            value={resetPassword}
            showIcon
            isError={!passwordMatch}
            helperText={passwordMatch ? 'Password Match' : helperResetPasswordText}
            msgColor={passwordMatch ? 'success' : 'danger'}
            onChange={(e) => { handleChange(e.target.value, 'confirmPassword'); }}
          />

        </Box>
        <Checkbox label="Remember me" marginBottom="13px" onClick={(e) => handleRememberMe(e)} checked={rememberMe} />
      </Box>
      <Button
        color="primary"
        className="w-100"
        variant="contained"
        onClick={handleSubmit}
      >
        {loading ? 'Saving....' : 'Save'}
      </Button>
    </SignInStyle>
  );
};

export default Index;
