import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack, Box, TableCell, TableRow
} from '@mui/material';
import {
  debounce, isEmpty
} from 'lodash';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Table from '../../../../components/ag-grid-table/index';
import AutoComplete from '../../../../components/autoComplete';
import MultipleSelect from '../../../../components/multipleCheckbox/index';
import { confirmPosHeader, selectStore, PO_STATUS } from '../../../../constants/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader/index';

// images
import noData from '../../../../static/images/no-data-table.svg';

// redux
import {
  GetAllConfirmPOs,
  GetSuppliersOfConfirmPO,
  SetPurchaseOrderState,
  SetPoQueueItemState,
  SetPaymentDetailState
} from '../../../../redux/slices/purchasing';

const ViewPo = (props) => {
  const { onClose, onSelect } = props;

  const {
    confirmPOs,
    totalConfirmPOs,
    loading,
    supplierLoading,
    suppliersOfConfirmPO,
    confirmPOsFilter,
    viewConfirmPOPageLimit,
    viewConfirmPOPageNumber
  } = useSelector((state) => state.purchaseOrder);

  const dispatch = useDispatch();
  const [localConfirmPOs, setLocalConfirmPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [multiSelectOptions, setMultiSelectOptions] = useState([
    'Only Printed',
    'Only Received',
    'Only Completed',
    'Follow Up'
  ]);
  function createData(
    product,
    partNo,
    supplier,
    cost,
    price,
    total,
    stock,
    fba,
    printed,
    received,
    completed,
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
      printed,
      received,
      completed,
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
        <Box>
          <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
        </Box>,
        <Box>
          <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />
        </Box>,
        <Box>
          <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />
        </Box>,
        <RemoveRedEyeIcon sx={{ color: '#3C76FF', width: 16 }} className="pointer" onClick={onClose} />
      )
    );
  }

  const getAllConfirmPOs = ({ supplierId, extendedFilters }) => {
    const skip = (viewConfirmPOPageNumber - 1) * viewConfirmPOPageLimit;
    const limit = viewConfirmPOPageLimit;
    dispatch(GetAllConfirmPOs({
      skip,
      limit,
      filters: { supplierId, extendedFilters }
    }));
  };

  const getSuppliersOfConfirmPO = () => {
    dispatch(GetSuppliersOfConfirmPO({
      poStatus: PO_STATUS.confirm
    }));
  };

  const handleSearchSupplier = debounce((supplier) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewConfirmPOPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'confirmPOsFilter',
      value: {
        ...confirmPOsFilter,
        supplier
      }
    }));
  }, 500);

  const handlePageNumber = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewConfirmPOPageNumber', value: e
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'viewConfirmPOPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'viewConfirmPOPageLimit', value: e
    }));
  };

  const handleExtendedFilter = (e) => {
    dispatch(
      SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
    );
    dispatch(SetPurchaseOrderState({
      field: 'confirmPOsFilter',
      value: {
        ...confirmPOsFilter,
        extendedFilters: e.target.value
      }
    }));
  };

  useEffect(() => {
    getAllConfirmPOs({
      supplierId: confirmPOsFilter?.supplier?.id,
      extendedFilters: confirmPOsFilter.extendedFilters
    });
    getSuppliersOfConfirmPO();
  }, []);

  useEffect(() => {
    if (confirmPOs?.length) {
      setLocalConfirmPOs(confirmPOs);
    } else {
      setLocalConfirmPOs([]);
    }
  }, [confirmPOs]);

  useEffect(() => {
    if (suppliersOfConfirmPO?.length) {
      const supplierItems = suppliersOfConfirmPO.map((item) => ({
        id: item?._id,
        value: item?._id,
        label: item?.code
      }));
      setSuppliers(supplierItems);
    } else {
      setSuppliers([]);
    }
  }, [suppliersOfConfirmPO]);

  useEffect(() => {
    getAllConfirmPOs({
      supplierId: confirmPOsFilter?.supplier?.id,
      extendedFilters: confirmPOsFilter.extendedFilters
    });
  }, [confirmPOsFilter,
    viewConfirmPOPageLimit,
    viewConfirmPOPageNumber]);

  useEffect(() => () => {
    if (!window.location.pathname.includes('/purchasing')) {
      dispatch(
        SetPurchaseOrderState({
          field: 'confirmPOsFilter',
          value: {
            supplier: {
              id: '',
              value: '',
              label: ''
            }
          }
        })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageLimit', value: 100 })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
      );

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
          <h2 className="m-0 pl-2">Confirmed POs</h2>
        </Stack>
        <Box display="flex" gap={2}>
          <MultipleSelect
            vertical
            placeholder="Select"
            width={201}
            name="extendedFilters"
            label="Extended Filters:"
            values={multiSelectOptions}
            onChange={handleExtendedFilter}
            checkedList={confirmPOsFilter.extendedFilters}
            value={confirmPOsFilter.extendedFilters}
          />
          <AutoComplete
            width="160px"
            placeholder="Supplier"
            label="Search:"
            vertical
            // options={selectStore}
            value={confirmPOsFilter?.supplier}
            onChange={(e, val) => {
              handleSearchSupplier(val);
            }}
            options={suppliers}
          />
        </Box>
      </Box>
      <Box mt={3}>
        <Table fixed alignCenter tableHeader={confirmPosHeader} height="188px" bodyPadding="8px 12px">
          {loading
            ? <LoaderWrapper />
            : localConfirmPOs?.length ? localConfirmPOs?.map((row) => (
              <TableRow
                hover
                key={row?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{ minWidth: 250, width: '22%' }}>
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
                <TableCell>
                  $
                  {row?.shippingPrice}
                </TableCell>
                <TableCell>
                  $
                  {row?.tax}
                </TableCell>
                <TableCell>
                  $
                  {row?.poTotalCost}
                </TableCell>
                <TableCell>
                  <Box>
                    {row?.poStatus === PO_STATUS.printed
                      ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
                      : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />}

                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {row?.poStatus === PO_STATUS.received
                      ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
                      : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {row?.poStatus === PO_STATUS.closed
                      ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
                      : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <RemoveRedEyeIcon
                    sx={{ color: '#3C76FF', width: 16 }}
                    className="pointer"
                    onClick={() => {
                      onClose();
                      onSelect(row);
                    }}
                  />
                </TableCell>
              </TableRow>
            )) : !loading && totalConfirmPOs === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={12} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 260px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )}

        </Table>
        <Pagination
          componentName="purchasing"
          perPageRecord={confirmPOs?.length || 0}
          total={totalConfirmPOs}
          totalPages={Math.ceil(totalConfirmPOs / viewConfirmPOPageLimit)}
          offset={totalConfirmPOs}
          pageNumber={viewConfirmPOPageNumber}
          pageLimit={viewConfirmPOPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </>
  );
};

export default ViewPo;
