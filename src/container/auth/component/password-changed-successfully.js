import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// components
import Alert from '../../../components/alert/index';
import Button from '../../../components/button/button.styled';
import SignIn from '../index';

import CheckSvg from '../../../static/images/sent.svg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <SignIn copyRight heading="Password Update" caption="Your password has been changed successfully.">
      <Box textAlign="center">
        <img src={CheckSvg} alt="no-icon" className="add-margin" />
      </Box>
      <Box sx={{ marginTop: '22px' }}>
        <Alert icon={false} severity="success" marginBottom="26px">
          Awesome, your password has been changed.
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
    </SignIn>
  );
};

export default Index;
