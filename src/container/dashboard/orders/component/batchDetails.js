import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import Tabs from '../../../../components/tabs/index';
import OpenBatches from './openBatches';
import CompleteBatches from './completeBatches';

const batchDetails = (props) => {
  const { onClose } = props;
  const [tabValue, setTabValue] = useState(0);

  const navigate = useNavigate();
  const [tabs, setTabs] = useState([
    {
      title: 'Open Batches',
      component: <OpenBatches />
    },
    {
      title: 'Completed Batches',
      component: <CompleteBatches />
    }
  ]);

  return (
    <div>
      <Stack alignItems="center" direction="row" mt={3.25}>
        <Box component="span" className="icon-left pointer" onClick={() => navigate('/orders/pick-sheet')} />
        <h2 className="m-0 pl-2">Batch Details</h2>
      </Stack>
      <Box mt={3.375}>
        {/* <Tabs
          tabs={tabs}
          value={tabValue}
          onTabChange={(newValue) => setTabValue(newValue)}
        /> */}
        <OpenBatches />
      </Box>
    </div>
  );
};

export default batchDetails;
