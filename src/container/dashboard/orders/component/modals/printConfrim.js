import React from 'react';
import { Box } from '@mui/material';

import LoaderWrapper from '../../../../../components/loader';
import Modal from '../../../../../components/modal';
import Button from '../../../../../components/button';

const Delete = (props) => {
  const {
    show, onClose, onConfirm, loading
  } = props;

  return (
    <div>
      <Modal show={show} width={471} onClose={onClose}>
        { loading ? <LoaderWrapper /> : null }
        <Box sx={{ position: 'relative', padding: '32px', minWidth: '362px' }} className="reinvite-modal">
          <Box textAlign="center" mb={2} component="h2">
            Batch Confirmation
          </Box>
          <Box textAlign="center" color="#5A5F7D" fontSize="13px">Do you want to create a batch?</Box>
          <Box display="flex" justifyContent="flex-end" gap={7.75} mt={3}>
            <Button variant="text" text="Yes" onClick={onConfirm} />
            <Button variant="outlined" text="No" className="btn-large" onClick={onClose} />
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Delete;
