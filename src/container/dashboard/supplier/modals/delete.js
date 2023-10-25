import React from 'react';
import { Box, Stack } from '@mui/material';
import Modal from '../../../../components/modal/index';
import Alert from '../../../../static/images/alert.svg';
import Button from '../../../../components/button/index';

const Delete = (props) => {
  const {
    show, onClose, lastTitle, onSave
  } = props;

  return (
    <div>
      <Modal show={show} width={362} onClose={onClose}>
        <Box sx={{ position: 'relative', padding: '32px', minWidth: '362px' }} className="reinvite-modal">
          <Stack alignItems="center" justifyContent="center">
            <Box mt={5 / 8}>
              <img src={Alert} alt="no-logo" />
            </Box>
            <Box textAlign="center" sx={{ marginTop: '32px' }}>
              <h3 className="m-0">
                Are You Sure You Want To
              </h3>
              <h3 className="m-0">
                {lastTitle || 'Delete The Items!'}
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              You won’t be able to revert it back.
            </Box>

          </Stack>
          <Stack spacing={3} pt={4} direction="row" justifyContent="end">
            <Button variant="text" text="Yes" className="btn-large" onClick={onSave} />
            <Button variant="outlined" text="No" className="btn-large" onClick={onClose} />
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default Delete;
