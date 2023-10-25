import React, { useState, useEffect } from 'react';

import { ReactSVG } from 'react-svg';
import { Pagination, Box, Stack } from '@mui/material';
// constant
import { paginationValue, paginationValueWithMoreLimit } from '../../constants/index';
// component
import Button from '../button/index';
import Select from '../select/index';

import ReloadIcon from '../../static/images/icon-reload.svg';

// style
import PaginationWrapper from './style';

const Index = (props) => {
  const {
    perPageRecord = 0,
    componentName = 'others',
    total,
    totalPages,
    position,
    pageNumber,
    pageLimit,
    handlePageLimitChange,
    handlePageNumberChange,
    width,
    handleReloadPage
  } = props;

  const [selectedValue, setSelectedValue] = useState({ value: 20, label: 20 });

  useEffect(() => {
    if (pageLimit) {
      setSelectedValue(pageLimit);
    }
  }, [pageLimit]);

  const handlePageClick = (event, value) => {
    handlePageNumberChange(value);
  };

  const handlePageLimit = (e) => {
    setSelectedValue(e);
    handlePageLimitChange(e);
  };

  return (
    <PaginationWrapper width={width} position={position}>
      <Box
        sx={{
          background: '#F8F8F8', color: '#5A5F7D', padding: '8px 16px', maxHeight: '32px', paddingRight: 0
        }}
        alignItems="center"
        display="flex"
        justifyContent="space-between"
      >
        <Box sx={{ fontSize: 11 }} component="span">
          {pageNumber || '1'}
          {' '}
          -
          <Box component="span" mr={0.25}>
            {perPageRecord}
          </Box>
          of
          <Box component="span" ml={-0.125} mr={0.3}>
            {' '}
            {total}
          </Box>
          Records
        </Box>
        <Stack direction="row" spacing={1}>
          {componentName === 'order-manager'
            ? (
              <Button
                className="icon-button"
                tooltip="Reload"
                startIcon={
                  <ReactSVG className="icon-reload-custom" src={ReloadIcon} />
                }
                onClick={() => handleReloadPage()}
              />
            ) : null}
          <Pagination
            page={pageNumber}
            count={totalPages}
            onChange={handlePageClick}
          />
          <Box component="span" sx={{ marginRight: '-8px' }}>
            <Select
              menuItem={componentName === 'products'
                || componentName === 'jobs'
                || componentName === 'users'
                || componentName === 'suppliers'
                || componentName === 'purchasing'
                || componentName === 'orders'
                || componentName === 'order-manager'
                || componentName === 'notifications'
                ? paginationValueWithMoreLimit
                : paginationValue}
              value={selectedValue}
              border="none"
              handleChange={(e) => handlePageLimit(e.target.value)}
            />
          </Box>
        </Stack>
      </Box>
    </PaginationWrapper>
  );
};

export default Index;
