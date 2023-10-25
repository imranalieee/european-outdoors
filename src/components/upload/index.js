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
    disabled,
    className
  } = props;

  return (
    <UploadWrapper className={className}>
      <Box position="relative" className={disabled ? null : 'input-type'}>
        { loading ? <LoaderWrapper /> : null}
        {
          disabled ? null
            : <input type="file" onChange={(e) => handleChangeAttachment(e)} id="upload-attachment" accept={accept} />
        }
        <div className="upload-file pointer">
          <div className="d-flex align-items-center flex-column upload">
            <span><img src={UploadIcon} alt="upload icon" /></span>
            <span>
              {title}
            </span>
            {attachmentName
              || (
              <Button
                startIcon={<span className="icon-choose-file" />}
                onClick={() => document.getElementById('upload-attachment').click()}
                disabled={disabled}
                text="Choose File"
              />
              ) }
          </div>
        </div>
      </Box>
    </UploadWrapper>
  );
};

export default Index;
