import React, { useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import Modal from '../../../../../components/modal/index';
import Alert from '../../../../../static/images/alert.svg';
import Button from '../../../../../components/button/index';
import LoaderWrapper from '../../../../../components/loader';

const Delete = (props) => {
  const {
    show,
    onClose,
    lastTitle,
    onDelete,
    loading,
    focusYes,
    confirmShipment,
    purchaseShipmentForVendorCentral
  } = props;

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && confirmShipment) {
      purchaseShipmentForVendorCentral();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div>
      <Modal show={show} width={362} onClose={onClose}>
        <Box sx={{ position: 'relative', padding: '32px', minWidth: '362px' }} className="reinvite-modal">
          {loading ? <LoaderWrapper /> : null}
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
            <Button variant={focusYes ? 'outlined' : 'text'} text="Yes" className="btn-large" onClick={onDelete} />
            <Button variant={focusYes ? 'text' : 'outlined'} text="No" className="btn-large" onClick={onClose} />
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default Delete;
