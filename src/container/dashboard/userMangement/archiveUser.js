import React from 'react';
// material
import { Divider, Box } from '@mui/material';
// images
import Archived from '../../../static/images/archived.svg';

const ArchiveUser = () => (
  <>
    {/* <h2>Archive User</h2>
    <Divider sx={{ backgroundColor: '#979797', margin: '24px 0px' }} /> */}
    <Box textAlign="center" pt={7}>
      <Box mb={6.1}>
        <img src={Archived} alt="no-user" />
      </Box>
      <Box component="h1" className="text-error" mb={2}>
        Your account has been archived
      </Box>
      <Box component="h3" sx={{ textTransform: 'capitalize' }}>Please contact with admin for unarchived</Box>
    </Box>
  </>
);

export default ArchiveUser;
