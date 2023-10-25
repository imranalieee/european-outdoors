import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
// component
import Alert from '../../../components/alert/index';
import Button from '../../../components/button/button.styled';
import Input from '../../../components/inputs/input/index';

import { ForgotPassword, SetAuthState } from '../../../redux/slices/auth-slice';

import { ValidateEmail } from '../../../../utils/helpers';

// style
import SignIn from '../index';

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [helperEmailText, setHelperEmailText] = useState('');

  const handleSubmit = () => {
    const emailError = ValidateEmail({ email });
    setHelperEmailText(emailError);

    if (emailError === '') {
      dispatch(ForgotPassword({ email }));
    }
  };

  const handleSetEmail = (value) => {
    setEmail(value);
    const emailError = ValidateEmail({ email: value });
    setHelperEmailText(emailError);
  };

  useEffect(() => {
    if (success) {
      localStorage.setItem('email', JSON.stringify(email));
      navigate('/auth/email-send');
    }

    return () => {
      dispatch(SetAuthState({ field: 'success', value: false }));
    };
  }, [success]);

  return (
    <SignIn copyRight heading="Forgot Password" caption="Updated password with European Outdoors ">

      <Alert severity="warning" icon={false} marginBottom="26px">
        Enter your email and instructions will be sent to you!
      </Alert>
      <Box className="auth-content-top">
        <Input
          autoComplete="off"
          hiddenLabel
          placeholder="Enter email address"
          size="medium"
          label="Email address"
          width="100%"
          CheckIcon={!!(email !== '' && helperEmailText === '')}
          marginBottom="40px"
          helperText={helperEmailText}
          value={email}
          onChange={(e) => handleSetEmail(e.target.value)}
        />
      </Box>
      <Button
        color="primary"
        className="w-100"
        variant="contained"
        onClick={handleSubmit}
      >
        {loading ? 'Submit....' : 'Submit'}
      </Button>
      <Box className="remember-password" sx={{ color: '#000000', fontSize: 10, marginTop: '17px' }} textAlign="center">
        <span>Wait, I remember my password</span>
        <Link
          onClick={() => navigate('/auth/sign-in')}
          to="/auth/sign-in"
        >
          Login
        </Link>
      </Box>
    </SignIn>
  );
};

export default Index;
