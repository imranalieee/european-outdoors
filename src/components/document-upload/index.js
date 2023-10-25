import React from 'react';
import { Box } from '@mui/material';

import LoaderWrapper from '../loader';
// images
import UploadIcon from '../../static/images/upload.svg';
// styles
import UploadWrapper from './style';

const Index = (props) => {
  const {
    marginBottom,
    handleChangeAttachment,
    attachmentName,
    accept,
    title,
    loading,
    supportedFormat,
    disabled,
    className
  } = props;

  return (
    <UploadWrapper className={className} marginBottom={marginBottom}>
      <div className={disabled ? null : 'input-type'}>
        { loading ? <LoaderWrapper /> : null}
        { attachmentName }
        {
          !disabled
            ? (
              <input
                type="file"
                onChange={(e) => handleChangeAttachment(e)}
                id="upload-attachment"
                accept={accept}
              />
            )
            : null
        }

        <div className="upload-file pointer">
          <div className="d-flex align-items-center flex-column upload">
            <span><img src={UploadIcon} alt="upload icon" width="56px" /></span>
            <span>
              {title}
              {' '}
              <Box component="span" sx={{ color: '#3C76FF' }}>Browse</Box>
            </span>
            <Box sx={{ color: '#3C76FF', fontSize: '11px' }}>
              {supportedFormat}
            </Box>
          </div>
        </div>
      </div>
    </UploadWrapper>
  );
};

export default Index;
