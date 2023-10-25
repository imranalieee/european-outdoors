import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
import Cookies from 'universal-cookie';
import CryptoJS from 'crypto-js';
// components
import Button from '../../../components/button/button.styled';
import Input from '../../../components/inputs/input/index';
import Checkbox from '../../../components/checkbox/index';

import { SignIn, SetAuthState } from '../../../redux/slices/auth-slice';

import { ValidateEmail } from '../../../../utils/helpers';
// style
import SignInStyle from '../index';

const cookies = new Cookies();

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [helperEmailText, setHelperEmailText] = useState('');
  const [helperPasswordText, setHelperPasswordText] = useState('');
  const [rememberMe, setRememberMeCheckbox] = useState(false);

  const handleChange = (value, key) => {
    if (key === 'email') {
      setEmail(value);
    } else if (key === 'password') {
      setPassword(value);
    }
  };

  const handleLogin = () => {
    const emailError = ValidateEmail({ email });
    setHelperEmailText(emailError);

    if (isEmpty(password)) {
      setHelperPasswordText('Password is required!');
    } else {
      setHelperPasswordText('');
    }

    if (emailError === '' && !isEmpty(password)) {
      if (rememberMe) {
        const encodedPassword = CryptoJS.AES.encrypt(password, process.env.HASH).toString();

        cookies.set('email', email, { maxAge: 60 * 60 * 24 });
        cookies.set('password', encodedPassword, { maxAge: 60 * 60 * 24 });
        cookies.set('rememberMe', rememberMe, { maxAge: 60 * 60 * 24 });
      } else {
        cookies.remove('email', { maxAge: 60 * 60 * 24 });
        cookies.remove('password', { maxAge: 60 * 60 * 24 });
        cookies.remove('rememberMe', { maxAge: 60 * 60 * 24 });
      }
      dispatch(SignIn({ email, password }));
    }
  };

  const handleRememberMe = (e) => {
    setRememberMeCheckbox(e.target.checked);
  };

  useEffect(() => {
    const emailFromCookies = cookies.get('email');
    const passwordFromCookies = cookies.get('password');
    const rememberMeFromCookies = cookies.get('rememberMe');

    if (passwordFromCookies) {
      const bytes = CryptoJS.AES.decrypt(passwordFromCookies, process.env.HASH);
      const decodedPassword = bytes.toString(CryptoJS.enc.Utf8);
      setPassword(decodedPassword);
    }
    if (emailFromCookies) {
      setEmail(emailFromCookies);
    }
    if (rememberMeFromCookies) {
      setRememberMeCheckbox(rememberMeFromCookies);
    }

    return () => {
      dispatch(SetAuthState({ field: 'success', value: false }));
    };
  }, []);

  return (
    <SignInStyle copyRight heading="User Login" caption="Sign in to continue to European Outdoors">
      <Box className="auth-content-top">
        <Input
          autoComplete="off"
          hiddenLabel
          placeholder="Enter email address"
          size="medium"
          label="Email address"
          width="100%"
          marginBottom="32px"
          helperText={helperEmailText}
          value={email}
          onChange={(e) => handleChange(e.target.value, 'email')}
        />
        <Input
          autoComplete="off"
          hiddenLabel
          placeholder="Enter password"
          type="password"
          size="medium"
          label="Password"
          width="100%"
          showPassword
          marginBottom="12px"
          helperText={helperPasswordText}
          value={password}
          onChange={(e) => handleChange(e.target.value, 'password')}
          showIcon
        />
        <Checkbox label="Remember me" marginBottom="11px" onClick={(e) => handleRememberMe(e)} checked={rememberMe} />
      </Box>
      <Button
        color="primary"
        className="w-100"
        variant="contained"
        onClick={handleLogin}
      >
        {loading ? 'Login....' : 'Login'}
      </Button>
      <div className="forget-password">
        <Link
          onClick={() => navigate('/auth/forget-password')}
          to="/auth/forget-password"
        >
          Forgot Password?
        </Link>
      </div>
    </SignInStyle>
  );
};

export default Index;
