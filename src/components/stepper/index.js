import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
  Stack, Stepper, Step, StepLabel
} from '@mui/material/Stack';
import StepConnector, {
  stepConnectorClasses
} from '@mui/material/StepConnector';
import { Row, Col } from 'react-bootstrap';

import { BsCheck } from 'react-icons/bs';
import Button from '../button/button.styled';
import Upload from '../upload/index';
import Progresss from '../progress/index';
import fileUploaded from '../../static/images/fileuploaded.png';
import Input from '../inputs/input/index';
import Select from '../select/index';
import Modal from '../modal';

import { UploadWrapper } from '../upload/style';
import StepperStyle from './style';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 5
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: '#2589FF'
    }
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: '#2589FF'
    }
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#E6E6E6',
    borderRadius: 1
  }
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ffffff',
  zIndex: 1,
  width: 16,
  color: '#77838E',
  border: '1px solid #77838E',
  height: 16,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active
  && {
    background: '#ffffff',
    color: '#2589FF',
    border: '1px solid #2589FF'

  }),
  ...(ownerState.completed
  && {
    background: '#2589FF',
    color: '#ffffff',
    border: '1px solid #2589FF'
  })
}));

function ColorlibStepIcon(props) {
  const {
    active, completed, className, icon
  } = props;
  const icons = {
    1: <BsCheck />,
    2: <BsCheck />,
    3: <BsCheck />
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node
};

const steps = ['Upload File', 'Data Mapping', 'Status'];

const Steppers = () => {
  const [activeStep, setActiveStep] = useState(3);
  const [progress, setProgress] = useState(10);
  const [popup, setPopup] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const handleUploadfile = (e) => {
    setActiveStep(activeStep + 1);
  };
  const handleClick = () => {
    setPopup(true);
  };
  const selectVendors = [
    { value: 'Warehouse 1', label: 'Warehouse 1' },
    { value: 'Warehouse 2', label: 'Warehouse 2' },
    { value: 'Warehouse 3', label: 'Warehouse 3' },
    { value: '+ Add New Warehouse', label: <span className="primary-color" onClick={handleClick}>+ Add New Warehouse</span> }
  ];

  return (

    <Stack sx={{ width: '100%' }} spacing={4}>
      <StepperStyle>
        <Stepper
          alternativeLabel
          className="stepper-steps"
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <div className="step-congrats">
            <div className="step-image">
              <img src={fileUploaded} alt="Successful Upload Image" />
            </div>
            <h1>File Successfuly Uploaded!</h1>
            <p>
              Reference site about Lorem Ipsum, giving information on its origins,
              as well as a random Lipsum generator.
            </p>

            <Button>Done</Button>
          </div>
        ) : (
          <div>
            {activeStep === 0 && steps.length !== '0' ? (
              <div className="upload-step">
                {/* step 1 part 1 */}
                <div className="d-none">
                  <span className="step-title">
                    (To create listing, you need to add URL for the lisitng you want to create on Amazon or Walmart.)
                    <a href="#">Download Sample File</a>
                  </span>

                  <Upload uploadFile={handleUploadfile} />
                </div>
                {/* step 1 part 2 */}
                <UploadWrapper className="">
                  <div className="upload-file upload-progress ">
                    <div className="progressbar">
                      <Progresss percentage={progress} />
                    </div>
                    <p className="progress-status">Uploading File</p>
                  </div>
                </UploadWrapper>
              </div>
            ) : (
              <div className="step-mapping">
                <div className="mapping-header-fields">
                  <ul className="d-flex">
                    <li>
                      <Select
                        menuIsOpen
                        options={selectVendors}
                        label="Vendor"
                        placeholder="Select Vendor"
                      />
                    </li>
                    <li>
                      <Select
                        menuIsOpen
                        options={selectVendors}
                        label="Warehouse"
                        placeholder="Select Warehouse"
                      />
                    </li>
                    <li><Input label="Purchase Order Number" placeholder="PO Number" /></li>
                  </ul>
                </div>
                <div className="mapping-header-options">
                  <h3>Select type of data for columns in your file:</h3>
                  <div className="mapping-header-cols d-flex">
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>ASIN1N45C</li>
                        <li>ASIN1N45C</li>
                        <li>ASIN1N45C</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>$60.02</li>
                        <li>$60.02</li>
                        <li>$60.02</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>13</li>
                        <li>13</li>
                        <li>13</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>13</li>
                        <li>13</li>
                        <li>13</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>439</li>
                        <li>439</li>
                        <li>439</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>439</li>
                        <li>439</li>
                        <li>439</li>
                      </ul>
                    </div>
                    <div className="mapping-header-col">
                      <div className="mapping-header">
                        <Select placeholder="Don't Import" label="Column" />
                      </div>
                      <ul>
                        <li>439</li>
                        <li>439</li>
                        <li>439</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mapping-note">
                    You have to select atleast ASIN, Cost Price and ROI columns.
                  </p>
                </div>
                <Button
                  color="inherit"
                  onClick={() => setActiveStep((prevActiveStep) => prevActiveStep - 1)}
                  sx={{ mr: 1 }}
                >
                  {activeStep === steps.length + 1 ? 'Done' : 'Import'}
                </Button>
                <Modal header heading="Add Vendor" open={popup} saveText="save" closeText="Cancel" onClose={() => setPopup(false)}>
                  <Row>
                    <Col md={4}>
                      <Input label="Name" placeholder="Name" />
                    </Col>
                    <Col md={4}>
                      <Input label="Address Line 1" placeholder="Address Line 1" />
                    </Col>
                    <Col md={4}>
                      <Input label="Address Line 1" placeholder="Address Line 1" />
                    </Col>
                    <Col md={4}>
                      <Input label="City" placeholder="City" />
                    </Col>
                    <Col md={4}>
                      <Select placeholder="State" label="State" />
                    </Col>
                    <Col md={4}>
                      <Input label="Zip Code" placeholder="00000  " />
                    </Col>
                  </Row>
                </Modal>
              </div>
            )}
          </div>
        )}
      </StepperStyle>
    </Stack>
  );
};
export default Steppers;
