import React from 'react';
import {
  Box, TableCell, TableRow
} from '@mui/material';

import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';

import { completeBatchesHeader } from '../../../../constants/index';

const CompleteBatches = () => {
  function createData(
    order,
    orderId,
    recipient,
    sale,
    date
  ) {
    return {
      order,
      orderId,
      recipient,
      sale,
      date
    };
  }
  const data = [];
  for (let i = 0; i <= 3; i += 1) {
    data.push(
      createData(
        '544-011-P1',
        'Pick Sheet & Packing Slip',
        '12/02/2022 • 10:09AM',
        'Amanda',
        '56'
      )
    );
  }

  return (
    <>
      <Box component="h3" mt={-0.875}>Completed Batches </Box>
      <Box mt={2.25}>
        <Table fixed alignCenter tableHeader={completeBatchesHeader} height="277px" bodyPadding="12px 11px">
          {data.map((row) => (
            <TableRow
              hover
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.order}
              </TableCell>
              <TableCell>{row.orderId}</TableCell>
              <TableCell>{row.recipient}</TableCell>
              <TableCell>{row.sale}</TableCell>
              <TableCell>{row.date}</TableCell>
            </TableRow>
          ))}

        </Table>
        <Pagination
          total="133588"
        />
      </Box>
    </>
  );
};

export default CompleteBatches;
