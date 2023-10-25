import React from 'react';
import { Box } from '@mui/material';

import Button from '../button/index';
import LoaderWrapper from '../loader';
// images
import UploadIcon from '../../static/images/upload.svg';
// styles
import UploadWrapper from './style';

const Index = (props) => {
  const {
    handleChangeAttachment,
    attachmentName,
    accept,
    title,
    loading,
    disabled
  } = props;

  return (
    <UploadWrapper>
      <div className={disabled ? null : 'input-type'}>
        {loading ? <LoaderWrapper /> : null}
        {disabled ? null : (
          <input
            autoComplete="off"
            type="file"
            onChange={(e) => handleChangeAttachment(e)}
            id="upload-attachment"
            accept={accept}
          />
        )}
        <div className="upload-file pointer">
          <Box className="d-flex align-items-center upload">
            <Box mr={56 / 8}>
              <span>
                <img width="32px" src={UploadIcon} alt="upload icon" />
              </span>
              <span>{title}</span>
            </Box>
            {attachmentName ? (
              <Box className="attachment-name" title={attachmentName}>{attachmentName}</Box>
            ) : (
              <Button
                startIcon={<span className="icon-choose-file" />}
                onClick={() => document.getElementById('upload-attachment').click()}
                disabled={disabled}
                text="Choose File"
                padding="4px 11px 4px 18px"
              />
            )}
          </Box>
        </div>
      </div>
    </UploadWrapper>
  );
};

export default Index;
