import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import ProgressBarWrapper from './style';

function LinearProgressWithLabel(props) {
  return (
    <Box className="progress-customized" sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box
        sx={{ minWidth: 35 }}
        color="#272B41"
        fontSize="9px"
        fontWeight={500}
      >
        {`${Math.round(props.value)}%`}
      </Box>
    </Box>
  );
}

const ProgressBar = (props) => (
  <ProgressBarWrapper>
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={props.value} />
    </Box>
  </ProgressBarWrapper>
);
export default ProgressBar;
