import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import { debounce, isEmpty, camelCase } from 'lodash';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Select from '../../../../components/select/index';
import Table from '../../../../components/ag-grid-table/index';
import AutoComplete from '../../../../components/autoComplete';
import MultipleSelect from '../../../../components/multipleCheckbox/index';
import {
  allPosHeader,
  orderType,
  PO_STATUS,
  allPosHeaderSort
} from '../../../../constants/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader/index';

// images
import noData from '../../../../static/images/no-data-table.svg';

// redux
import {
  GetAllConfirmPOs,
  GetSuppliersOfConfirmPO,
  SetPurchaseOrderState,
  SetPaymentDetailState,
  SetPoQueueItemState
} from '../../../../redux/slices/purchasing';
import ProductHeaderWrapper from '../../products/style';

const AllPO = (props) => {
  const { onClose, onSelect } = props;

  const {
    confirmPOs,
    totalConfirmPOs,
    loading,
    supplierLoading,
    suppliersOfConfirmPO,
    confirmPOsFilter,
    viewConfirmPOPageLimit,
    viewConfirmPOPageNumber,
    selectedSupplierPO
  } = useSelector((state) => state.purchaseOrder);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [localConfirmPOs, setLocalConfirmPOs] = useState([]);
  const [selectComponent, setSelectComponent] = useState('allPO');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  const [sortValue, setSortValue] = useState({});

  const handleConfirmPO = (poId) => {
    navigate(`/purchasing/confirm/${poId}`);
  };

  const handleNonConfirmPO = (poId) => {
    navigate(`/purchasing/non-confirm/${poId}`);
  };

  const [multiSelectOptions, setMultiSelectOptions] = useState([
    'Only Printed',
    'Only Received',
    'Only Completed',
    'Follow Up'
  ]);
  function createData(
    product,
    potype,
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
      potype,
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
        <RemoveRedEyeIcon
          sx={{ color: '#3C76FF', width: 16 }}
          className="pointer"
        />
      )
    );
  }

  const getAllConfirmPOs = ({ supplierId, extendedFilters, poStatus }) => {
    const skip = (viewConfirmPOPageNumber - 1) * viewConfirmPOPageLimit;
    const limit = viewConfirmPOPageLimit;
    dispatch(
      GetAllConfirmPOs({
        skip,
        limit,
        filters: { supplierId, extendedFilters, poStatus },
        sortBy: sortValue
      })
    );
  };

  const getSuppliersOfConfirmPO = () => {
    dispatch(
      GetSuppliersOfConfirmPO({
        poStatus: confirmPOsFilter.poStatus
          ? confirmPOsFilter?.poStatus
          : PO_STATUS.inQueue
      })
    );
  };

  const handleSearchSupplier = debounce((supplier) => {
    dispatch(
      SetPurchaseOrderState({
        field: 'viewConfirmPOPageNumber',
        value: 1
      })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'confirmPOsFilter',
        value: {
          ...confirmPOsFilter,
          supplier
        }
      })
    );
  }, 500);

  const handlePageNumber = (e) => {
    dispatch(
      SetPurchaseOrderState({
        field: 'viewConfirmPOPageNumber',
        value: e
      })
    );
  };

  const handlePageLimit = (e) => {
    dispatch(
      SetPurchaseOrderState({
        field: 'viewConfirmPOPageNumber',
        value: 1
      })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'viewConfirmPOPageLimit',
        value: e
      })
    );
  };

  const handleExtendedFilter = (e) => {
    dispatch(
      SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'confirmPOsFilter',
        value: {
          ...confirmPOsFilter,
          extendedFilters: e.target.value
        }
      })
    );
  };

  const handlePOStatus = (e) => {
    dispatch(
      SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'confirmPOsFilter',
        value: {
          ...confirmPOsFilter,
          poStatus: e
        }
      })
    );
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
    }

    setSortValue({
      [sortKey]: newSortValue
    });
  };

  useEffect(() => {
    getAllConfirmPOs({
      supplierId: confirmPOsFilter?.supplier?.id,
      extendedFilters: confirmPOsFilter.extendedFilters,
      poStatus: confirmPOsFilter.poStatus
    });
    getSuppliersOfConfirmPO();
  }, [selectComponent]);

  // useEffect(() => {
  //   if (confirmPOs?.length) {
  //     setLocalConfirmPOs(confirmPOs);
  //   } else {
  //     setLocalConfirmPOs([]);
  //   }
  // }, [confirmPOs]);

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
      extendedFilters: confirmPOsFilter.extendedFilters,
      poStatus: confirmPOsFilter.poStatus
    });
    getSuppliersOfConfirmPO();
  }, [confirmPOsFilter, viewConfirmPOPageLimit, viewConfirmPOPageNumber, sortValue]);

  useEffect(() => () => {
    dispatch(SetPurchaseOrderState({ field: 'confirmPOs', value: [] }));
    if (!window.location.pathname.includes('/purchasing')) {
      dispatch(
        SetPurchaseOrderState({
          field: 'confirmPOsFilter',
          value: {
            supplier: {
              id: '',
              value: '',
              label: ''
            },
            extendedFilters: [],
            poStatus: ''
          }
        })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageLimit', value: 100 })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
      );

      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageLimit', value: 100 })
      );
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: 1 })
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
    }
  }, []);

  useEffect(() => {
    dispatch(
      SetPurchaseOrderState({
        field: 'poDeleted',
        value: false
      })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'poConfirmed',
        value: false
      })
    );
  }, []);

  useEffect(() => {
    if (!isEmpty(selectedSupplierPO)) {
      if (selectedSupplierPO?.status === PO_STATUS.nonConfirm) {
        setSelectComponent('nonConfirm');
        setSelectedPoId(selectedSupplierPO?.poId);
      } else if (selectedSupplierPO?.status !== PO_STATUS.nonConfirm
        && selectedSupplierPO?.status !== PO_STATUS.inQueue) {
        setSelectComponent('confirmPO');
        setSelectedPoId(selectedSupplierPO?.poId);
      }
    }
  }, [selectedSupplierPO]);

  return (
    <Box>
      <Box>
        <ProductHeaderWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <h2 className="m-0">All PO</h2>
          <Box  display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
            <AutoComplete
              width="200px"
              placeholder="Supplier"
              label="Search:"
              vertical
              value={confirmPOsFilter?.supplier}
              onChange={(_e, val) => {
                handleSearchSupplier(val);
              }}
              options={suppliers}
            />
            <MultipleSelect
              vertical
              placeholder="Select"
              width={200}
              name="extendedFilters"
              label="Extended Filters:"
              values={multiSelectOptions}
              onChange={handleExtendedFilter}
              checkedList={confirmPOsFilter.extendedFilters}
              value={confirmPOsFilter.extendedFilters}
            />
            <AutoComplete
              width="200px"
              placeholder="Status"
              label="Search:"
              vertical
              value={orderType?.find(
                (item) => item?.value === confirmPOsFilter.poStatus
              )}
              onChange={(e, val) => {
                handlePOStatus(val?.value);
              }}
              options={orderType}
            />
          </Box>
        </Box>
        </ProductHeaderWrapper>
        <Box mt={3}>
          <Table
            fixed
            alignCenter
            tableHeader={allPosHeader}
            height="188px"
            bodyPadding="8px 12px"
            sortableHeader={allPosHeaderSort}
            handleSort={handleSortChange}
            sortValue={sortValue}
          >
            {loading ? <LoaderWrapper /> : null}
            {confirmPOs?.length ? (
              confirmPOs?.map((row) => {
                let poPrinted = false;
                let poRecieved = false;
                let poClosed = false;
                if (row?.poStatus === PO_STATUS.printed) {
                  poPrinted = true;
                } else if (row?.poStatus === PO_STATUS.received) {
                  poPrinted = true;
                  poRecieved = true;
                } else if (row?.poStatus === PO_STATUS.closed) {
                  poPrinted = true;
                  poRecieved = true;
                  poClosed = true;
                }
                return (
                  <TableRow
                    hover
                    key={row?.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ minWidth: 90, width: '90px' }}
                    >
                      <Box
                        component="span"
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                      >
                        {row?.poId || '--'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {row?.poStatus === PO_STATUS.nonConfirm ? (
                        <Box component="span" className="badge failed">
                          Non Confirm
                        </Box>
                      ) : (
                        <Box component="span" className="badge success">
                          Confirm
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{row?.supplierId?.code || '--'}</TableCell>
                    <TableCell>
                      <Box className="product-name-clamp" component="span">
                        {row?.supplierId?.supplierName?.length > 20
                          ? (
                            <Tooltip
                              placement="top-start"
                              arrow
                              title={row?.supplierId?.supplierName}
                            >
                              <span>
                                {row?.supplierId?.supplierName}
                              </span>
                            </Tooltip>
                          ) : (
                            <span>
                              {row?.supplierId?.supplierName || '--'}
                            </span>
                          )}
                      </Box>

                    </TableCell>
                    <TableCell>
                      {row?.createdAt
                        ? moment(new Date(row?.createdAt)).format(
                          'MMM DD YYYY'
                        )
                        : '--'}
                    </TableCell>
                    <TableCell>{row?.poTotalQuantity || '--'}</TableCell>
                    <TableCell>
                      $
                      {row?.shippingPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      $
                      {row?.tax.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      $
                      {row?.poTotalCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Box>
                        {poPrinted ? (
                          <CheckCircleIcon
                            sx={{ color: '#0FB600', width: 16 }}
                          />
                        ) : (
                          <CheckCircleOutlinedIcon
                            sx={{ color: '#979797', width: 16 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {poRecieved ? (
                          <CheckCircleIcon
                            sx={{ color: '#0FB600', width: 16 }}
                          />
                        ) : (
                          <CheckCircleOutlinedIcon
                            sx={{ color: '#979797', width: 16 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {poClosed ? (
                          <CheckCircleIcon
                            sx={{ color: '#0FB600', width: 16 }}
                          />
                        ) : (
                          <CheckCircleOutlinedIcon
                            sx={{ color: '#979797', width: 16 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <RemoveRedEyeIcon
                        sx={{ color: '#3C76FF', width: 16 }}
                        className="pointer"
                        onClick={() => {
                          setSelectedPoId(row?.poId);
                          if (row?.poStatus === PO_STATUS.nonConfirm) {
                            handleNonConfirmPO(row?.poId);
                          } else {
                            handleConfirmPO(row?.poId);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              !loading
              && totalConfirmPOs === 0 && (
                <TableRow>
                  <TableCell
                    sx={{ borderBottom: '24px' }}
                    colSpan={12}
                    align="center"
                  >
                    <Box
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="calc(100vh - 260px)"
                    >
                      {/* <img
                          className="nodata-table-img"
                          src={noData}
                          height="100%"
                          style={{ maxWidth: '100%' }}
                          alt="no-Data"
                        /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )
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
      </Box>
    </Box>
  );
};

export default AllPO;
