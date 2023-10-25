import React from 'react';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { Box } from '@mui/material';

import Modal from '../../../../../components/modal/index';
import UploadFile from '../../../../../components/document-upload/index';
import Button from '../../../../../components/button/index';

const Upload = (props) => {
  const {
    show,
    onClose,
    attachment,
    attachmentLoading,
    handleChangeAttachment,
    attachmentName,
    accept = '.xlsx, .csv',
    title = 'Drag & drop files or',
    supportedFormat = 'Support Format CSV File',
    handleSaveAttachment
  } = props;

  return (
    <div>
      <Modal show={show} width={696} onClose={onClose}>
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '696px' }}>
          <CancelOutlinedIcon
            className="pointer"
            onClick={onClose}
            sx={{
              opacity: attachmentLoading ? 0.5 : 1,
              pointerEvents: attachmentLoading ? 'none' : 'auto',
              color: '#979797',
              fontSize: 17,
              position: 'absolute',
              right: '24px',
              top: '23px'
            }}
          />
          <h2>Import Bulk PO Queue</h2>
          <Box mt={3}>
            <UploadFile
              marginBottom="24px"
              accept={accept}
              title={title}
              supportedFormat={supportedFormat}
              handleChangeAttachment={(e) => handleChangeAttachment(e)}
              loading={attachmentLoading}
              attachmentName={attachmentName}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                text="Save"
                variant="contained"
                width="87px"
                startIcon={<span className="icon-Save" />}
                onClick={handleSaveAttachment}
                disabled={(attachmentLoading || !attachment)}
              />
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Upload;
