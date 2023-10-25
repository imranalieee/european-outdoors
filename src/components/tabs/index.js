import React from 'react';

import {
  Tabs, Box, Tab, Divider
} from '@mui/material';
// styles
import TabsWrapper from './style';

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box mt={3}>{children}</Box>}
    </Box>
  );
}

const Index = (props) => {
  const {
    tabs, value, onTabChange, divider, className, center, customPadding
  } = props;

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const handleTabChange = (_, v) => {
    onTabChange(v);
  };

  const tabsComponent = () => (
    <>
      {tabs?.map((tab, i) => (
        <TabPanel value={value} index={i} key={i}>
          {tab.component}
        </TabPanel>
      ))}
    </>
  );

  return (
    <TabsWrapper center={center} className={className} customPadding={customPadding}>
      <Tabs
        value={value}
        onChange={handleTabChange}
        className={divider ? 'divider' : ''}
      >
        {tabs?.map((tab, i) => (
          <Tab label={tab.title} {...a11yProps(i)} key={i} />
        ))}
      </Tabs>
      <Divider sx={{ marginTop: '0px' }} />
      {tabsComponent()}
    </TabsWrapper>
  );
};
export default Index;
