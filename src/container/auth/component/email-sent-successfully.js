import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Alert from '../../../components/alert/index';
import Button from '../../../components/button/button.styled';
import SignIn from '../index';

import { ForgotPassword, SetAuthState, SetAuthNotifyState } from '../../../redux/slices/auth-slice';

import { ValidateEmail } from '../../../../utils/helpers';

import CheckSvg from '../../../static/images/sent.svg';

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const handleResend = () => {
    const emailError = ValidateEmail({ email });

    if (emailError === '') {
      dispatch(ForgotPassword({ email }));
    } else {
      navigate('/auth/forget-password');
      dispatch(SetAuthNotifyState({ type: 'error', message: 'Invalid email!' }));
    }
  };

  useEffect(() => {
    const localEmail = localStorage.getItem('email');

    const localStorageEmail = JSON.parse(localEmail);
    if (localStorageEmail && localStorageEmail !== '') {
      setEmail(localStorageEmail);
    }

    return () => {
      dispatch(SetAuthState({ field: 'success', value: false }));
    };
  }, []);

  return (
    <SignIn copyRight heading="Email Sent Successfully" caption="Forgot password with European Outdoors ">
      <Box textAlign="center">
        <img src={CheckSvg} alt="no-icon" />
      </Box>
      <Box sx={{ marginTop: '21px' }}>
        <Alert icon={false} severity="success" marginBottom="27px">
          Awesome, your instruction has been sent to your email id.
        </Alert>
      </Box>

      <Button
        color="primary"
        className="w-100"
        variant="contained"
        onClick={() => navigate('/auth/sign-in')}
      >
        Login
      </Button>
      <Box className="remember-password" sx={{ color: '#000000', fontSize: 10, marginTop: '17px' }} textAlign="center">
        <span>If you didn’t receive an email</span>
        <a onClick={handleResend}>
          {' '}
          Resend
        </a>
      </Box>
    </SignIn>
  );
};

export default Index;
