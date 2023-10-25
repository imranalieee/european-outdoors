import React from 'react';
import { Box, Stack } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import LoaderWrapper from '../../../../../components/loader';
import Modal from '../../../../../components/modal/index';
import Sent from '../../../../../static/images/sent.svg';
import Button from '../../../../../components/button/index';

const Delete = (props) => {
  const {
    show, onClose, onConfirm, loading
  } = props;

  return (
    <div>
      <Modal show={show} width={362} onClose={onClose}>
        { loading ? <LoaderWrapper /> : null }
        <Box sx={{ position: 'relative', padding: '32px', minWidth: '362px' }} className="reinvite-modal">
          <CancelOutlinedIcon
            onClick={onClose}
            className="pointer"
            sx={{
              color: '#979797', fontSize: 17, position: 'absolute', right: '24px', top: '22px'
            }}
          />
          <Stack alignItems="center" justifyContent="center" mb={4}>
            <Box mt={5 / 8}>
              <img src={Sent} alt="no-logo" />
            </Box>
            <Box textAlign="center" sx={{ marginTop: '24px' }}>
              <h3 className="m-0">
                Changes Has Been Saved
              </h3>
              <h3 className="m-0">
                Successfully
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              You won’t be able to revert it back.
            </Box>
          </Stack>
          <Box>
            <Button variant="outlined" text="Ok" width="100%" className="btn-large" onClick={onConfirm} />
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Delete;
