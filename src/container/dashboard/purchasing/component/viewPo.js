import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack, Box, TableCell, TableRow
} from '@mui/material';
import {
  debounce, isEmpty
} from 'lodash';

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import Table from '../../../../components/ag-grid-table';
import AutoComplete from '../../../../components/autoComplete';
import Pagination from '../../../../components/pagination';

import LoaderWrapper from '../../../../components/loader/index';

// images
import noData from '../../../../static/images/no-data-table.svg';

import { nonConfirmPosHeader, PO_STATUS } from '../../../../constants';
// redux
import {
  GetAllNonConfirmPOs,
  GetSuppliersOfPO,
  SetPurchaseOrderState,
  SetPoQueueItemState,
  SetPaymentDetailState
} from '../../../../redux/slices/purchasing';

const ViewPo = (props) => {
  const dispatch = useDispatch();
  const {
    nonConfirmPOs,
    totalNonConfirmPOs,
    loading,
    supplierLoading,
    suppliersOfPO,
    nonConfirmPOsFilter,
    viewNonConfirmPOPageLimit,
    viewNonConfirmPOPageNumber
  } = useSelector((state) => state.purchaseOrder);

  const [localNonConfirmPOs, setLocalNonConfirmPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const { onClose, onSelect } = props;
  const top100Films = [
    { label: 'ATL-Q1', year: 1994 },
    { label: 'ATL-Q2', year: 1972 },
    { label: 'ATL-Q3', year: 1974 }
  ];

  function createData(
    product,
    partNo,
    supplier,
    cost,
    price,
    total,
    stock,
    fba,
    action
  ) {
    return {
      product,
      partNo,
      supplier,
      cost,
      price,
      total,
      stock,
      fba,
      action
    };
  }
  const data = [];
  for (let i = 0; i <= 10; i += 1) {
    data.push(
      createData(
        '18747',
        'SBC',
        'Phantom Aquatics',
        '28 Dec 2022 ',
        '$1450',
        '0',
        '0',
        '$1450',
        <Box display="flex" gap={2}>
          <RemoveRedEyeIcon sx={{ color: '#3C76FF', width: 16 }} className="pointer" onClick={onClose} />
        </Box>
      )
    );
  }

  const getAllNonConfirmPOs = ({ supplierId }) => {
    const skip = (viewNonConfirmPOPageNumber - 1) * viewNonConfirmPOPageLimit;
    const limit = viewNonConfirmPOPageLimit;
    dispatch(GetAllNonConfirmPOs({
      skip,
      limit,
      filters: { supplierId },
      poStatus: PO_STATUS.nonConfirm
    }));
  };

  const getSuppliersOfPO = () => {
    dispatch(GetSuppliersOfPO({
      poStatus: PO_STATUS.nonConfirm
    }));
  };

  const handleSearchSupplier = debounce((supplier) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewToPoQueuePageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'nonConfirmPOsFilter',
      value: {
        ...nonConfirmPOsFilter,
        supplier
      }
    }));
  }, 500);

  const handlePageNumber = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewNonConfirmPOPageNumber', value: e
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewNonConfirmPOPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'viewNonConfirmPOPageLimit', value: e
    }));
  };

  useEffect(() => {
    getAllNonConfirmPOs({ supplierId: nonConfirmPOsFilter?.supplier?.id });
    getSuppliersOfPO();
  }, []);

  useEffect(() => {
    if (nonConfirmPOs?.length) {
      setLocalNonConfirmPOs(nonConfirmPOs);
    } else {
      setLocalNonConfirmPOs([]);
    }
  }, [nonConfirmPOs]);

  useEffect(() => {
    if (suppliersOfPO?.length) {
      const supplierItems = suppliersOfPO.map((item) => ({
        id: item?._id,
        value: item?._id,
        label: item?.code
      }));
      setSuppliers(supplierItems);
    } else {
      setSuppliers([]);
    }
  }, [suppliersOfPO]);

  useEffect(() => {
    getAllNonConfirmPOs({ supplierId: nonConfirmPOsFilter?.supplier?.id });
  }, [nonConfirmPOsFilter,
    viewNonConfirmPOPageLimit,
    viewNonConfirmPOPageNumber]);

  useEffect(() => () => {
    if (!window.location.pathname.includes('/purchasing')) {
      dispatch(SetPurchaseOrderState({ field: 'viewNonConfirmPOPageNumber', value: 1 }));
      dispatch(SetPurchaseOrderState({ field: 'viewNonConfirmPOPageLimit', value: 100 }));
      dispatch(SetPurchaseOrderState({
        field: 'nonConfirmPOsFilter',
        value: {
          supplier: {
            id: '',
            value: '',
            label: ''
          }
        }
      }));
      dispatch(SetPoQueueItemState({ field: 'addItemsToPoQueuePageNumber', value: 1 }));
      dispatch(SetPoQueueItemState({ field: 'addItemsToPoQueuePageLimit', value: 100 }));
      dispatch(SetPoQueueItemState({
        field: 'addItemsToPoQueueFilters',
        value: {
          searchByKeyWords: {
            title: '',
            stockNumber: '',
            mfgPartNo: ''
          },
          supplierId: '',
          extendedFilters: []
        }
      }));
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageLimit', value: 100 })
      );
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: 1 })
      );
    }
  }, []);

  return (
    <>
      <Box display="flex" justifyContent="space-between" pt={1 / 8}>
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={onClose} />
          <h2 className="m-0 pl-2">Non Confirm POs</h2>
        </Stack>
        <AutoComplete
          width="160px"
          placeholder="Supplier"
          label="Search:"
          vertical
          value={nonConfirmPOsFilter?.supplier}
          onChange={(e, val) => {
            handleSearchSupplier(val);
          }}
          options={suppliers}
        />
      </Box>
      <Box mt={3}>
        <Table fixed alignCenter tableHeader={nonConfirmPosHeader} height="188px" bodyPadding="8px 11px">

          {loading
            ? <LoaderWrapper />
            : localNonConfirmPOs?.length ? localNonConfirmPOs?.map((row) => (
              <TableRow
                hover
                key={row?._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box component="span" display="flex" alignItems="center" gap={1.5}>

                    {row?.poId}
                  </Box>
                </TableCell>
                <TableCell>{row?.supplierId?.code}</TableCell>
                <TableCell>{row?.supplierId?.supplierName}</TableCell>
                <TableCell>
                  {moment(new Date(row?.timestamp)).format('MMM DD YYYY')
                    || '--'}

                </TableCell>
                <TableCell>{row?.poTotalQuantity}</TableCell>
                <TableCell>{row?.shippingPrice}</TableCell>
                <TableCell>{row?.tax}</TableCell>
                <TableCell>
                  $
                  {row?.poTotalCost}
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={2}>
                    <RemoveRedEyeIcon
                      sx={{ color: '#3C76FF', width: 16 }}
                      className="pointer"
                      onClick={() => {
                        onClose();
                        onSelect(row);
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              !loading && totalNonConfirmPOs === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={9} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 260px)">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            )}

        </Table>
        <Pagination
          componentName="purchasing"
          perPageRecord={nonConfirmPOs?.length || 0}
          total={totalNonConfirmPOs}
          totalPages={Math.ceil(totalNonConfirmPOs / viewNonConfirmPOPageLimit)}
          offset={totalNonConfirmPOs}
          pageNumber={viewNonConfirmPOPageNumber}
          pageLimit={viewNonConfirmPOPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </>
  );
};

export default ViewPo;
