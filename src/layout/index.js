import React from 'react';
import { Box } from '@mui/material';
// components
import Header from '../components/header/index';
import { orderSubheader, purchasingSubheader } from '../constants';
import SubHeader from '../components/subheader';

const Index = ({ children }) => {
  const pathName = window.location.pathname;
  return (
    <>
      <Header />

      { pathName.includes('/orders') && <SubHeader pathName="orders" center options={orderSubheader} />}
      { pathName.includes('/purchasing') && <SubHeader pathName="purchasing" center options={purchasingSubheader} />}
      <Box
        bgcolor="#fff"
        pt={pathName.includes('/purchasing') || pathName.includes('/orders') ? 6 : 9}
        px={3}
        pb={0}
      >
        {children}
      </Box>
    </>
  );
};

export default Index;
