import React, { useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow
} from '@mui/material';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
// component
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
// constants
import { boxLogs } from '../../../../../constants/index';
import LoaderWrapper from '../../../../../components/loader/index';

import ProductHeaderWrapper from '../../../products/style';
// Redux
import {
  GetBoxLogsByBoxId
} from '../../../../../redux/slices/order';

const BoxLogs = ({ box, onOpen, onClose }) => {
  const dispatch = useDispatch();

  const {
    boxLogs: boxLogDetails,
    boxlogsLoading
  } = useSelector((state) => state.processOrder);

  const getBoxLogsByBoxId = () => {
    if (!isEmpty(box?._id)) {
      dispatch(GetBoxLogsByBoxId({ boxId: box?._id }));
    }
  };

  const handleBoxDetailClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!isEmpty(box)) {
      getBoxLogsByBoxId();
    }
  }, [box]);

  return (
    <Drawer
      open={onOpen}
      width="700px"
      close={handleBoxDetailClose}
    >
      {boxlogsLoading ? <LoaderWrapper /> : null}
      <ProductHeaderWrapper>
      <Stack direction="row" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={handleBoxDetailClose}
          />
          <h2 className="m-0 pl-2">Box Details</h2>
        </Stack>
      </Stack>
      </ProductHeaderWrapper>
      <Box mt={3}>
        <Table
          tableHeader={boxLogs}
          bodyPadding="8px 12px"
          height="452px"
        >
          {boxlogsLoading ? <LoaderWrapper /> : null}

          {boxLogDetails?.length ? boxLogDetails?.map((row) => (
            <TableRow
              hover
              key={row?._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row?.boxCreatedBy?.name
                  ? row?.boxCreatedBy?.name
                  : row?.shipmentCreatedBy?.name
                    ? row?.shipmentCreatedBy?.name
                    : row?.labelPrintedBy?.name
                      ? row?.labelPrintedBy?.name
                      : row?.labelReprintedBy?.name
                        ? row?.labelReprintedBy?.name
                        : '--'}
              </TableCell>
              <TableCell component="th" scope="row">
                {row?.boxCreatedAt
                  ? moment(row?.createdAt).format('ddd, Do MMM YYYY, hh:mm:ss A')
                  : row?.shipmentCreatedAt
                    ? moment(row?.shipmentCreatedAt).format('ddd, Do MMM YYYY, hh:mm:ss A')
                    : row?.labelPrintedAt
                      ? moment(row?.labelPrintedAt).format('ddd, Do MMM YYYY, hh:mm:ss A')
                      : row?.labelReprintedAt
                        ? moment(row?.labelReprintedAt).format('ddd, Do MMM YYYY, hh:mm:ss A')
                        : '--'}
              </TableCell>
              <TableCell component="th" scope="row">
                {row?.boxCreatedBy?.name
                  ? 'Created Box'
                  : row?.shipmentCreatedBy?.name
                    ? 'Created Shipment'
                    : row?.labelPrintedBy?.name
                      ? 'Printed Label'
                      : row?.labelReprintedBy?.name
                        ? 'Re-Printed Label'
                        : '--'}
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                <Box
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="300px"
                />
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Box>
    </Drawer>
  );
};

export default BoxLogs;
