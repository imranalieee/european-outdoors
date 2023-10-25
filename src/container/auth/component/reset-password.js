import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/system';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
// components
import Button from '../../../components/button/button.styled';
import Input from '../../../components/inputs/input/index';
import Alert from '../../../components/alert/index';
import ResetPasswordWrapper from '../index';

import { ResetPassword, SetAuthState, SetAuthNotifyState } from '../../../redux/slices/auth-slice';

import { ValidatePassword } from '../../../../utils/helpers';

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    success
  } = useSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [helperPasswordText, setHelperPasswordText] = useState('');
  const [helperResetPasswordText, setHelperResetPasswordText] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);

  const handleResetPassword = () => {
    const passwordError = ValidatePassword({ password });
    setHelperPasswordText(passwordError);

    if (isEmpty(resetPassword)) {
      setHelperResetPasswordText('Confirm password is required!');
    } else if (password !== resetPassword) {
      setHelperResetPasswordText('Password Mismatch!');
    } else {
      setHelperResetPasswordText('');
    }

    if (passwordError === '' && (password === resetPassword)) {
      const query = new URLSearchParams(window.location.search);

      if (query.get('token') === null) {
        dispatch(SetAuthNotifyState({ type: 'error', message: 'Kindly Verify the Email Address' }));
        return;
      }

      const jwtToken = query.get('token');
      const decoded = jwtDecode(jwtToken);
      const { userId, exp } = decoded;
      const expirationTime = new Date(exp * 1000);

      if (expirationTime < new Date()) {
        navigate('/auth/forget-password');
        dispatch(SetAuthNotifyState({ type: 'error', message: 'Your link has been expired!' }));
      } else if (userId) {
        dispatch(ResetPassword({ userId, password }));
        setPasswordMatch(false);
      }
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
      navigate('/auth/password-changed');
    }
    return () => {
      dispatch(SetAuthState({ field: 'success', value: false }));
    };
  }, [success]);

  return (
    <ResetPasswordWrapper copyRight heading="Reset Password" caption="Enter new password and then confirm it.">
      <Alert severity="warning" icon={false} marginBottom="26px">
        Please use Upper & lower case letters and symbols (#@$)
      </Alert>
      <Box position="relative">
        <Stack direction="row" spacing={1} position="absolute" right={2} top={1}>
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
          showIcon
          marginBottom="34px"
          value={password}
          isError={!!helperPasswordText && password}
          msgColor={helperPasswordText && password ? 'danger' : 'default'}
          helperText={!password
            ? 'Password must contain Capital, small letter, number and symbols'
            : helperPasswordText}
          onChange={(e) => {
            handleChange(e.target.value, 'newPassword');
          }}
        />

      </Box>
      <Box position="relative">
        <Stack direction="row" spacing={1} position="absolute" right={2} top={1}>
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
          marginBottom="40px"
          showIcon
          value={resetPassword}
          isError={!passwordMatch}
          helperText={passwordMatch ? 'Password Match' : helperResetPasswordText}
          msgColor={passwordMatch ? 'success' : 'danger'}
          onChange={(e) => { handleChange(e.target.value, 'confirmPassword'); }}
        />

      </Box>
      <Button
        color="primary"
        className="w-100"
        variant="contained"
        onClick={handleResetPassword}
      >
        {loading ? 'Resetting Password....' : 'Reset Password'}
      </Button>
      <Box className="remember-password" sx={{ color: '#000000', fontSize: 10, marginTop: '16px' }} textAlign="center">
        <span>Wait, I remember my password</span>
        <Link
          onClick={() => navigate('/auth/sign-in')}
          to="/auth/sign-in"
        >
          Login
        </Link>
      </Box>
    </ResetPasswordWrapper>
  );
};

export default Index;
