import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow
} from '@mui/material';
import {
  isEmpty, camelCase
} from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
// component
import LoaderWrapper from '../../../../components/loader';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination';
// Redux
import {
  GetBoxesForViewOrder, SetOrderState
} from '../../../../redux/slices/order';

import { shipmentTrackHeader, sortShipmentTrackHeader } from '../../../../constants/index';

const ShipmentTracking = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const {
    orderBoxes,
    boxesLoading,
    totalOrderBoxes
  } = useSelector((state) => state.order);

  const [boxes, setBoxes] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [sortValue, setSortValue] = useState({});
  const [createdData, setCraetedData] = useState([]);

  function OrderedcreateData(
    itemDetails,
    boxedQuantity,
    toBoxQuantity,
    shipmentCarrier,
    trackingID,
    Amount
  ) {
    return {
      itemDetails,
      boxedQuantity,
      toBoxQuantity,
      shipmentCarrier,
      trackingID,
      Amount
    };
  }

  const getBoxesByOrderId = () => {
    if (!isEmpty(orderId)) {
      const skip = (pageNumber - 1) * pageLimit;
      const limit = pageLimit;
      dispatch(GetBoxesForViewOrder({ orderId, skip, limit }));
    }
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handleSortChange = (e, header) => {
    const sortKey = camelCase(header);
    const currentSortValue = sortValue[sortKey];

    let newSortValue;

    if (!currentSortValue) {
      newSortValue = 'asc';
    } else if (currentSortValue === 'asc') {
      newSortValue = 'desc';
    } else {
      newSortValue = '';
      setBoxes(createdData);

      setSortValue((prevSortValue) => ({
        [sortKey]: newSortValue
      }));
      return;
    }

    setSortValue((prevSortValue) => ({
      [sortKey]: newSortValue
    }));

    let sortByValue = '';
    if (sortKey === 'boxedQuantity') sortByValue = 'boxedQuantity';
    else if (sortKey === 'mskus') sortByValue = 'toBoxQuantity';
    else if (sortKey === 'shipmentCarrier') sortByValue = 'shipmentCarrier';
    else if (sortKey === 'trackingId') sortByValue = 'trackingID';

    const sortedData = boxes?.slice().sort((a, b) => {
      let compareValue;

      if (typeof a[sortByValue] === 'number' && typeof b[sortByValue] === 'number') {
        compareValue = (a[sortByValue] || 0) - (b[sortByValue] || 0);
      } else {
        compareValue = a[sortByValue]?.localeCompare(b[sortByValue]);
      }

      return newSortValue === 'asc' ? compareValue : -compareValue;
    });
    setBoxes([...sortedData]);
  };

  useEffect(() => {
    if (orderBoxes?.length) {
      const data = orderBoxes?.map((item) => {
        const boxedQuantity = item?.items
          ?.reduce(
            (accumulator, object) => accumulator + object?.productQuantity,
            0
          );
        return OrderedcreateData(
          <Stack direction="row" spacing={1}>
            <Stack direction="row" spacing={1.5}>
              <Box component="span" fontSize="31px" marginLeft="-2px" className="icon-products" />
              <Stack direction="row" spacing={1 / 2} alignItems="center">
                <Stack>
                  <Box
                    component="span"
                    color="#5A5F7D"
                    fontSize="13px"
                  >
                    {item?.length || '--'}
                  </Box>
                  <Box
                    component="span"
                    color="#979797"
                    fontSize="10px"
                    pt={0.25}
                  >
                    L(in)

                  </Box>
                </Stack>
                <Box
                  alignSelf="flex-start"
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                >
                  x

                </Box>
                <Stack>
                  <Box
                    component="span"
                    color="#5A5F7D"
                    fontSize="13px"
                  >
                    {item?.width || '--'}

                  </Box>
                  <Box
                    component="span"
                    color="#979797"
                    fontSize="10px"
                    pt={0.25}
                  >
                    W(in)

                  </Box>
                </Stack>
                <Box
                  alignSelf="flex-start"
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                >
                  x

                </Box>
                <Stack>
                  <Box
                    component="span"
                    color="#5A5F7D"
                    fontSize="13px"
                  >
                    {item?.height || '--'}

                  </Box>
                  <Box
                    component="span"
                    color="#979797"
                    fontSize="10px"
                    pt={0.25}
                  >
                    D(in)

                  </Box>
                </Stack>
              </Stack>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="13px"
              >
                {item?.weight || '--'}

              </Box>
              <Box
                component="span"
                color="#979797"
                fontSize="10px"
                pt={0.25}
              >
                Wt.(lb)

              </Box>
            </Stack>
          </Stack>,
          boxedQuantity || 0,
          item?.items?.length || 0,
          item?.shipmentCarrier || '--',
          item?.trackingNo || '--'
        );
      });
      setBoxes(data);
      setCraetedData(data);
    } else {
      setBoxes([]);
      setCraetedData([]);
    }
  }, [orderBoxes]);

  useEffect(() => {
    if (!isEmpty(orderId)) {
      getBoxesByOrderId();
    }
  }, [orderId, pageLimit, pageNumber]);

  useEffect(() => {
    const { id } = params;
    setOrderId(id);

    return () => {
      setPageNumber(1);
      dispatch(
        SetOrderState({
          field: 'orderBoxes',
          value: []
        })
      );
    };
  }, []);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="mb-0">Shipment & tracking</h3>
      </Box>
      <Box mt={3} position="relative">
        {boxesLoading ? <LoaderWrapper /> : null}
        <Table
          fixed
          tableHeader={shipmentTrackHeader}
          height="635px"
          bodyPadding="8px 12px"
          className="supplier-details-table"
          sortableHeader={sortShipmentTrackHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {boxes.length ? (
            boxes?.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box
                    component="span"
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                  >
                    {row.itemDetails}
                  </Box>
                </TableCell>
                <TableCell>{row.boxedQuantity || '--'}</TableCell>
                <TableCell>{row.toBoxQuantity || '--'}</TableCell>
                <TableCell>{row.shipmentCarrier}</TableCell>
                <TableCell>{row.trackingID}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                sx={{ borderBottom: '24px' }}
                colSpan={13}
                align="center"
              >
                <Box
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="135px"
                >
                  {/* <img
                    className="nodata-table-img"
                    src={noDataImg}
                    height="100%"
                    style={{ maxWidth: '100%' }}
                    alt="no-Data"
                  /> */}
                </Box>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Box>
    </>
  );
};
export default ShipmentTracking;
