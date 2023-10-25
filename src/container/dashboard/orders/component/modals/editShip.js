import React, { useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import moment from 'moment';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import LoaderWrapper from '../../../../../components/loader';
import Modal from '../../../../../components/modal/index';
import Button from '../../../../../components/button/index';
import Input from '../../../../../components/inputs/input/index';

const DateModal = (props) => {
  const {
    show, onClose, onConfirm, loading,
    handleDateChange, date, helperText
  } = props;

  return (
    <div>
      <Modal show={show} width={471} onClose={onClose}>
        {loading ? <LoaderWrapper /> : null}
        <Box
          sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}
          className="reinvite-modal"
        >
          <CancelOutlinedIcon
            onClick={onClose}
            className="pointer"
            sx={{
              color: '#979797',
              fontSize: 17,
              position: 'absolute',
              right: '23px',
              top: '22px'
            }}
          />
          <Stack mb={4}>
            <Box mb={3}>
              <h2 className="m-0">Edit Ship by Date</h2>
            </Box>

            <Input
              width="100%"
              marginBottom="0"
              type="date"
              label="Ship By Date"
              name="shipbydate"
              placeholder="Select"
              value={date}
              helperText={helperText}
              onChange={(e) => handleDateChange(e)}
            />
          </Stack>
          <Box display="flex" justifyContent="flex-end" gap={3}>
            <Button variant="text" text="Cancel" onClick={onClose} />
            <Button
              variant="contained"
              startIcon={<span className="icon-Save" />}
              text="Save"
              disabled={loading}
              onClick={onConfirm}
            />
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default DateModal;
