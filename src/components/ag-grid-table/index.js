import { camelCase } from 'lodash';
import React from 'react';
import {
  TableBody, TableCell, TableHead, TableRow, TableSortLabel, Table, Box
} from '@mui/material';
import SortingArrows from '../../static/images/sorting-arrows';
// component
import Checkbox from '../checkbox/index';
// styles
import TableWrapper from './style';

export default function BasicTable(props) {
  const {
    children, tableHeader, height, checkbox, maxheight, onChange,
    handleHeaderCheckBoxClicked, isChecked, bodyPadding, fixed, alignCenter, className, minheight,
    sortableHeader = [], handleSort, sortValue = {}, disabled = false
  } = props;

  return (
    <TableWrapper
      height={height}
      maxheight={maxheight}
      minheight={minheight}
      bodyPadding={bodyPadding}
      fixed={fixed}
      checkbox={checkbox}
      alignCenter={alignCenter}
      className={className}
    >
      <Table sx={{ minWidth: 650 }} stickyHeader column>
        {tableHeader && (
          <TableHead>
            <TableRow>
              {tableHeader.map((header, i) => {
                if (sortableHeader.includes(header)) {
                  return (
                    <TableCell key={i}>
                      <TableSortLabel
                        active={sortValue[camelCase(header)] !== ''}
                        direction={sortValue[camelCase(header)]}
                        onClick={(e) => handleSort(e, header)}
                        className={
                          sortValue[camelCase(header)] === 'asc'
                            ? 'sort-ascending'
                            : sortValue[camelCase(header)] === 'desc'
                              ? 'sort-descending'
                              : null
                        }
                        IconComponent={SortingArrows}
                      >
                        {header}
                      </TableSortLabel>
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={i}>
                    <Box
                      component="span"
                      display={i === 0 ? 'flex' : ''}
                      gap={i === 0 ? 1.5 : ''}
                    >
                      {checkbox && i === 0 ? <Checkbox disabled={disabled} onChange={onChange} marginBottom="0" checked={isChecked} className="header-checkbox" onClick={handleHeaderCheckBoxClicked} /> : ''}
                      {header}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
