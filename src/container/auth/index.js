import React from 'react';
import Box from '@mui/material/Box';
// Commmon Component
import { AuthWrapper } from './style';

const Index = (props) => {
  const {
    children, copyRight, heading, caption
  } = props;

  return (
    <>
      <AuthWrapper>
        <div className="auth-content">
          <div className="auth-heading">
            <Box component="h2" mb={1.6}>{heading}</Box>
            <p>{caption}</p>
          </div>
          {children}
        </div>
      </AuthWrapper>
      {copyRight && (
        <Box textAlign="center" sx={{ paddingTop: '49px', color: '#7C8092' }} position="relative">
          Copyright © 2023 European Outdoors, All rights reserved
        </Box>
      )}
    </>
  );
};

export default Index;
