import React from 'react';
import {
  Grid, Stack, Box, Tooltip
} from '@mui/material';

const Vendor = ({ props }) => {
  const {
    account,
    city,
    companyName,
    streetAddress,
    supplierName,
    email,
    code,
    state,
    country,
    zipCode,
    phone,
    fax,
    paymentTerms
  } = props || {};

  return (
    <div>
      <Box component="h3" mt={3}>Supplier</Box>
      <Grid container sx={{ marginTop: '25px' }} columnSpacing={0.375} border="1px solid #D9D9D9;" p={3} borderRadius="4px" mb={3}>
        <Grid item md={2}>
          <Stack spacing={0.25} mb={1.75}>
            <label>Company Name</label>
            <Box component="span" color="#272B41">{companyName || '--'}</Box>
          </Stack>
          <Stack spacing={0.25}>
            <label>Street Address</label>
            <Box component="span" color="#272B41">{streetAddress || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={2}>
          <Stack spacing={0.25} mb={1.75}>
            <label>Supplier Name</label>
            <Box
              sx={{
                whiteSpace: 'nowrap', overflow: 'hidden'
              }}
              textOverflow="ellipsis"
              maxWidth="200px"
              component="span"
              color="#272B41"
            >
              {
                supplierName?.length > 17
                  ? (
                    <Tooltip
                      placement="top-start"
                      arrow
                      title={supplierName}
                    >
                      <span>
                        {supplierName}
                      </span>
                    </Tooltip>
                  )
                  : (
                    <span>
                      {supplierName || '--'}
                    </span>
                  )
              }
            </Box>
          </Stack>
          <Stack spacing={0.25}>
            <label>City</label>
            <Box component="span" color="#272B41">{city || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={2}>
          <Stack spacing={0.25} mb={1.75} ml={5.3}>
            <label>Code</label>
            <Box component="span" color="#272B41">{code || '--'}</Box>
          </Stack>
          <Stack spacing={0.25} ml={5.3}>
            <label>State/Province </label>
            <Box component="span" color="#272B41">{state || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={1}>
          <Stack spacing={0.25} mb={1.75}>
            <label>Account #</label>
            <Box component="span" color="#272B41">{account || '--'}</Box>
          </Stack>
          <Stack spacing={0.25}>
            <label>Country</label>
            <Box component="span" color="#272B41">{country || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={2}>
          <Stack spacing={0.25} mb={1.75} ml={5.125}>
            <label>Email Address</label>
            <Box
              component="span"
              color="#272B41"
              sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
              textOverflow="ellipsis"
              maxWidth="200px"
            >
              {
                email?.length > 17
                  ? (
                    <Tooltip
                      placement="top-start"
                      arrow
                      title={email}
                    >
                      <span>
                        {email}
                      </span>
                    </Tooltip>
                  )
                  : (
                    <span>
                      {email || '--'}
                    </span>
                  )
              }
            </Box>
          </Stack>
          <Stack spacing={0.25} ml={5.125}>
            <label>Zip Code</label>
            <Box component="span" color="#272B41">{zipCode || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={2}>
          <Stack spacing={0.25} mb={1.75} ml={5.875}>
            <label>Phone #</label>
            <Box component="span" color="#272B41">{phone || '--'}</Box>
          </Stack>
          <Stack spacing={0.25} ml={5.875}>
            <label>Payment Terms</label>
            <Box component="span" color="#272B41">{paymentTerms || '--'}</Box>
          </Stack>
        </Grid>
        <Grid item md={1}>
          <Stack spacing={0.25} mb={1.75} ml={1.875}>
            <label>Fax #</label>
            <Box component="span" color="#272B41" sx={{ wordBreak: 'break-word' }}>{fax || '--'}</Box>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default Vendor;
