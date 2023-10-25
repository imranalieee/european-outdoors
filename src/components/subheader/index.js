import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MenuItem, Box
} from '@mui/material';

// style
import SubHeaderWrapper from './style';

const SubHeader = (props) => {
  const {
    className, center, customPadding, options, pathName
  } = props;

  const location = useLocation();

  return (
    <SubHeaderWrapper center={center} className={className} customPadding={customPadding}>
      <Box className="subheader-list" sx={{ display: { xs: 'none', md: 'flex' } }}>
        {options.map((page, index) => {
          let isActive = true;

          if (pathName === 'orders') {
            if (page.to !== '/orders') {
              isActive = !!(location.pathname)?.includes(page.to);
            } else if (page.to === '/orders') {
              if (!(location.pathname)?.includes('/orders/pick-sheet') && !(location.pathname)?.includes('/orders/process-orders')) isActive = true;
              else isActive = false;
            }
          }

          if (pathName === 'purchasing') {
            if (page.to === '/purchasing/all-po') {
              isActive = (location.pathname)?.includes(page.to) || (location.pathname)?.includes('/purchasing/confirm') || (location.pathname)?.includes('/purchasing/non-confirm');
            } else if (page.to === '/purchasing/po-queue' && location.pathname === '/purchasing/po-queue') {
              isActive = true;
            } else if (page.to === '/purchasing' && location.pathname === '/purchasing') {
              isActive = true;
            } else isActive = false;
          }

          return (
            <NavLink
              key={index}
              to={page.to}
              className={() => (isActive ? 'item-active subhead-item' : 'subhead-item')}
            >
              <MenuItem key={index} className="subhead-item-inner">
                <span>{page.title}</span>
              </MenuItem>
            </NavLink>
          );
        })}
      </Box>
    </SubHeaderWrapper>
  );
};

export default SubHeader;
