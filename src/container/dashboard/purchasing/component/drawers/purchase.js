import { isEmpty, startCase, camelCase } from 'lodash';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Divider,
  Grid,
  Stack,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// components
import AutoComplete from '../../../../../components/autoComplete';
import Button from '../../../../../components/button/index';
import Drawer from '../../../../../components/drawer/index';
import Input from '../../../../../components/inputs/input/index';
import LoaderWrapper from '../../../../../components/loader/index';
import Pagination from '../../../../../components/pagination/index';
import Table from '../../../../../components/ag-grid-table/index';
// redux
import {
  AddItemToPoQueue,
  GetItemPurchaseHistoryByProductAndSupplierId,
  SetPoQueueItemState,
  SetPurchaseOrderState
} from '../../../../../redux/slices/purchasing';
import {
  GetSuppliers
} from '../../../../../redux/slices/supplier-slice';
// helpers
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
// constant
import {
  purchaseHeader,
  REGEX_FOR_NUMBERS,
  REGEX_FOR_DECIMAL_NUMBERS,
  sortPurchaseHeader
} from '../../../../../constants';
// images
import noData from '../../../../../static/images/no-data-table.svg';
import DrawerProduct from '../../../../../static/images/no-product-image.svg';

const PurchaseDrawer = (props) => {
  const {
    open,
    onClose,
    openAnotherDrawer,
    productId,
    supplierId,
    setSelectedSupplierId,
    queueItem
  } = props;

  const dispatch = useDispatch();

  const {
    user: { permissions: { editPurchasing = false } }
  } = useSelector((state) => state.auth);

  const { suppliers = [] } = useSelector((state) => state.supplier);

  const {
    purchasingLoading,
    success: purchasingSuccess,
    itemPurchaseHistoryPageNumber,
    itemPurchaseHistoryPageLimit,
    itemPurchaseHistory,
    totalOfItemPurchaseHistory,
    addedItemToPOQueue
  } = useSelector((state) => state.poQueueItem);

  const {
    openPoCreated
  } = useSelector((state) => state.purchaseOrder);

  const [edit, setEdit] = useState(false);
  const [itemPurchaseHistoryData, setItemPurchaseHistoryData] = useState([]);
  const [prevSupplier, setPrevSupplier] = useState({});
  const [addToQueueItem, setAddToQueueItem] = useState({
    unitCost: '',
    poQuantity: ''
  });
  const [addToQueueItemHelper, setAddToQueueItemHelper] = useState({
    unitCost: '',
    poQuantity: ''
  });
  const [searchBySupplier, setSearchBySupplier] = useState({
    id: '',
    value: '',
    label: ''
  });
  const [sortValue, setSortValue] = useState({});

  const createPurchaseData = (
    _id,
    supplier,
    poQty,
    cost,
    total,
    moq,
    date,
    action
  ) => ({
    _id,
    supplier,
    poQty,
    cost,
    total,
    moq,
    date,
    action
  });

  const getItemPurchaseHistory = () => {
    const skip = (itemPurchaseHistoryPageNumber - 1) * itemPurchaseHistoryPageLimit;
    const limit = itemPurchaseHistoryPageLimit;

    dispatch(GetItemPurchaseHistoryByProductAndSupplierId({
      skip,
      limit,
      filters: { poStatus: 'CONFIRMED' },
      productId,
      supplierId,
      sortBy: sortValue
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetPoQueueItemState({ field: 'itemPurchaseHistoryPageNumber', value: e }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPoQueueItemState({ field: 'itemPurchaseHistoryPageNumber', value: 1 }));
    dispatch(SetPoQueueItemState({ field: 'itemPurchaseHistoryPageLimit', value: e }));
  };

  const handleSaveAddItemToQueue = (openDrawer) => {
    const {
      poQuantity,
      unitCost
    } = addToQueueItem;

    const errors = {};

    if (poQuantity === '') {
      errors.poQuantity = 'Po Quantity is required!..';
    } else if (poQuantity < 0) {
      errors.poQuantity = 'Min 0 value allowed!..';
    }
    if (unitCost === '') {
      errors.unitCost = 'Unit Cost is required!..';
    } else if (unitCost < 0) {
      errors.unitCost = 'Min 0 value allowed!..';
    }

    if (isEmpty(errors)) {
      if (openDrawer) {
        openAnotherDrawer();
      } else {
        dispatch(AddItemToPoQueue({
          items: [{
            productId,
            poQuantity,
            unitCost: Number(unitCost).toFixed(2)
          }]
        }));
      }

      dispatch(SetPoQueueItemState({ field: 'poQueueItems', value: [] }));
    } else {
      setAddToQueueItemHelper(errors);
    }
  };

  const handleChangeAddItemToQueue = (e) => {
    const { value, name } = e.target;

    if (value === '') {
      setAddToQueueItemHelper({
        ...addToQueueItemHelper,
        [name]: `${startCase(name)} is required!`
      });
    } else if (value && Number(value) < 1) {
      setAddToQueueItemHelper({
        ...addToQueueItemHelper,
        [name]: 'Min 1 value allowed!'
      });
    } else {
      setAddToQueueItemHelper({
        ...addToQueueItemHelper,
        [name]: ''
      });
    }
    setAddToQueueItem({
      ...addToQueueItem,
      [name]: value !== '' ? value : ''
    });
    dispatch(SetPurchaseOrderState({
      field: 'queueQuantity',
      value: {
        ...addToQueueItem,
        [name]: value !== '' ? Number(value) : ''
      }
    }));
  };

  const handleClearStates = () => {
    setAddToQueueItem({
      unitCost: '',
      poQuantity: ''
    });
    dispatch(SetPurchaseOrderState({
      field: 'queueQuantity',
      value: {
        unitCost: 0,
        poQuantity: 0
      }
    }));
    setAddToQueueItemHelper({
      unitCost: '',
      poQuantity: ''
    });
    setEdit(false);
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const supplierItems = suppliers.map((item) => ({
    id: item._id,
    value: item._id,
    label: item.code
  }));

  const getSuppliers = () => {
    dispatch(GetSuppliers({ fetchAll: true }));
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
    if (purchasingSuccess && edit) {
      // setEdit(false);
    }
  }, [purchasingSuccess]);

  useEffect(() => {
    if (itemPurchaseHistory?.length) {
      const data = itemPurchaseHistory.map((row) => (
        createPurchaseData(
          row._id,
          queueItem?.supplier || '--',
          row.poQuantity !== undefined && row.poQuantity !== null ? row.poQuantity : '--',
          `$${Number(row?.unitCost || 0).toFixed(2)}`,
          (Number(row.poQuantity || 0) * Number(row.unitCost || 0))?.toFixed(2),
          row.minimumOq || '--',
          moment(row.updatedAt).format('llll'),
          <Box
            className="icon-document-pen pointer"
            onClick={() => {
              setEdit(true);
              setAddToQueueItem({
                unitCost: row.unitCost || '',
                poQuantity: row.poQuantity || ''
              });
              dispatch(SetPurchaseOrderState({
                field: 'queueQuantity',
                value: {
                  unitCost: row.unitCost || 0,
                  poQuantity: row.poQuantity || 0
                }
              }));
            }}
            sx={{
              opacity: !editPurchasing ? 0.5 : 1,
              pointerEvents: !editPurchasing ? 'none' : 'auto'
            }}
          />
        )
      ));
      setItemPurchaseHistoryData(data);
    } else {
      setItemPurchaseHistoryData([]);
    }
  }, [itemPurchaseHistory]);

  useEffect(() => {
    if (productId && supplierId) {
      getItemPurchaseHistory();
    }
    if (!isEmpty(supplierId)) {
      const findSupplier = suppliers?.find((item) => item?._id === supplierId);
      setSearchBySupplier({
        id: findSupplier?._id,
        value: findSupplier?._id,
        label: findSupplier?.code
      });
    } else {
      setSearchBySupplier({
        id: '',
        value: '',
        label: ''
      });
    }
    if (!isEmpty(supplierId) && isEmpty(prevSupplier)) {
      const findSupplier = suppliers?.find((item) => item?._id === supplierId);
      setPrevSupplier({
        id: findSupplier?._id,
        value: findSupplier?._id,
        label: findSupplier?.code
      });
    } else if (isEmpty(supplierId)) {
      setPrevSupplier({});
    }
  }, [productId, supplierId, sortValue]);

  useEffect(() => {
    setEdit(false);
    onClose();
    setAddToQueueItem({
      unitCost: '',
      poQuantity: ''
    });
    setAddToQueueItemHelper({
      unitCost: '',
      poQuantity: ''
    });
  }, [addedItemToPOQueue, openPoCreated]);

  useEffect(() => {
    getSuppliers();
  }, []);

  return (
    <Drawer
      open={open}
      width="696px"
      close={() => {
        handleClearStates();
        onClose();
        setEdit(false);
      }}
    >
      {purchasingLoading ? <LoaderWrapper /> : null}
      <Stack alignItems="center" direction="row" spacing={3}>
        <Box
          component="span"
          className="icon-left pointer"
          onClick={() => {
            onClose();
            setAddToQueueItem({
              unitCost: '',
              poQuantity: ''
            });
            setAddToQueueItemHelper({
              unitCost: '',
              poQuantity: ''
            });
            setEdit(false);
          }}
        />
        <h2 className="m-0 pl-2">Purchase</h2>
      </Stack>
      <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
      <Stack direction="row" spacing={4}>
        <img
          width="76px"
          height="76px"
          onError={(e) => handleImageError(e, DrawerProduct)}
          src={
            queueItem?.primaryImageUrl
              ? GetS3ImageUrl({
                bucketName: 'productImage', key: queueItem?.primaryImageUrl
              })
              : DrawerProduct
          }
          alt="no-product"
        />
        <Box>
          <Box mt={0.25} mb={2.125} component="h3" className="product-name-clamp">
            {queueItem?.title?.length > 30
              ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={queueItem?.title}
                >
                  <span>
                    {queueItem?.title}
                  </span>
                </Tooltip>
              )
              : (
                <span>
                  {queueItem?.title || '--'}
                </span>
              )}
          </Box>
          <Stack direction="row" mb={3.5}>
            <Box display="flex" flexDirection="column" gap="6px" mr={105 / 8}>
              <Box component="span" color="#979797" fontSize="11px">Stock Number</Box>
              <Box component="span" color="#272B41" fontSize="13px">{queueItem?.stockNumber || '--'}</Box>
            </Box>
            <Box display="flex" flexDirection="column" gap="6px" mr={74 / 8}>
              <Box component="span" color="#979797" fontSize="11px">MFG Part no.</Box>
              <Box component="span" color="#272B41" fontSize="13px">{queueItem?.mfgPartNo || '--'}</Box>
            </Box>
            <Box display="flex" flexDirection="column" gap="6px">
              <Box component="span" color="#979797" fontSize="11px">Supplier</Box>
              <Box component="span" color="#272B41" fontSize="13px">{queueItem?.supplier || '--'}</Box>
            </Box>
          </Stack>
        </Box>
      </Stack>
      <Box component="h3">History</Box>
      <Box mt={0.875} position="relative">
        <Table
          tableHeader={purchaseHeader}
          height="493px"
          bodyPadding="13px 12px"
          sortableHeader={sortPurchaseHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {itemPurchaseHistoryData?.length ? itemPurchaseHistoryData.map((row) => (
            <TableRow
              hover
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{row.supplier}</TableCell>
              <TableCell>{row.poQty}</TableCell>
              <TableCell>{row.cost}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.moq}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell align="right">{row.action}</TableCell>
            </TableRow>
          )) : !purchasingLoading && (
            <TableRow>
              <TableCell sx={{ borderBottom: '24px' }} colSpan={9} align="center">
                <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                  {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                </Box>
              </TableCell>
            </TableRow>
          )}

        </Table>
        <Pagination
          perPageRecord={itemPurchaseHistory?.length || 0}
          componentName="purchasing"
          total={totalOfItemPurchaseHistory}
          totalPages={Math.ceil(totalOfItemPurchaseHistory / itemPurchaseHistoryPageLimit)}
          pageNumber={itemPurchaseHistoryPageNumber}
          pageLimit={itemPurchaseHistoryPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
          width="0"
        />
      </Box>
      <Divider sx={{ margin: '25px 0' }} />
      <Stack alignItems="center" justifyContent="space-between" direction="row" spacing={3}>
        <Box component="h3">Preview</Box>
        {!edit
          ? (
            <Button
              disabled={!editPurchasing}
              text="Edit"
              padding="4px 15px 4px 10px"
              onClick={() => setEdit(true)}
              startIcon={<span className="icon-edit" />}
            />
          )
          : (
            <Button
              text="Cancel"
              disabled={!editPurchasing}
              onClick={() => {
                setAddToQueueItem({
                  unitCost: '',
                  poQuantity: ''
                });
                setAddToQueueItemHelper({
                  unitCost: '',
                  poQuantity: ''
                });
                setEdit(false);
                setSelectedSupplierId(prevSupplier?.id);
              }}
              startIcon={(
                <CancelOutlinedIcon sx={{ fontSize: '16px', color: '#3C76FF' }} />
              )}
            />
          )}
      </Stack>
      <Grid container columnSpacing={2.25} sx={{ marginTop: '17px' }}>
        <Grid item md={3}>
          <Input
            autoComplete="off"
            minValue={0}
            disabled={!edit}
            label="PO Qty"
            width="100%"
            name="poQuantity"
            value={!edit ? addToQueueItem.poQuantity || 0 : addToQueueItem.poQuantity || ''}
            helperText={addToQueueItemHelper.poQuantity}
            onChange={(e) => {
              if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                handleChangeAddItemToQueue(e);
              } else {
                e.target.value = '';
              }
            }}
          />
        </Grid>
        <Grid item md={3}>
          <Input
            autoComplete="off"
            minValue={0}
            disabled={!edit}
            label="Unit Cost"
            width="100%"
            name="unitCost"
            value={!edit ? `$${Number(addToQueueItem.unitCost)?.toFixed(2)}` : addToQueueItem.unitCost || ''}
            helperText={addToQueueItemHelper.unitCost}
            onChange={(e) => {
              if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                handleChangeAddItemToQueue(e);
              } else {
                e.target.value = '';
              }
            }}
          />
        </Grid>
        <Grid item md={3}>
          <Input
            autoComplete="off"
            minValue={0}
            disabled
            label="Line Total"
            width="100%"
            placeholder="0"
            value={`$${Number(addToQueueItem.unitCost * addToQueueItem.poQuantity)?.toFixed(2)}`}
          />
        </Grid>
        <Grid item md={3} pt={2}>
          <AutoComplete
            disabled={!edit || !queueItem?.supplier}
            name="supplier"
            onChange={(e, val) => {
              setSearchBySupplier(val);
              setSelectedSupplierId(val?.id);
            }}
            value={searchBySupplier}
            width="160px"
            placeholder="Supplier"
            vertical
            options={supplierItems}
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={0.875}>
        <Button
          disabled={
            !editPurchasing
            || addToQueueItemHelper.poQuantity !== ''
            || addToQueueItemHelper.unitCost !== ''
            || !edit
          }
          text="Add to Open PO"
          startIcon={<AddCircleOutlineOutlinedIcon color="#3C76FF" fontSize="16px" />}
          onClick={() => { handleSaveAddItemToQueue(true); }}
        />
        <Button
          disabled={
            !editPurchasing
            || addToQueueItemHelper.poQuantity !== ''
            || addToQueueItemHelper.unitCost !== ''
            || !edit
            || queueItem?.supplier !== searchBySupplier?.label
          }
          text="Add to Queue"
          variant="contained"
          onClick={() => { handleSaveAddItemToQueue(false); }}
          startIcon={<AddCircleOutlineOutlinedIcon color="#3C76FF" fontSize="16px" />}
        />
      </Stack>
    </Drawer>
  );
};
export default PurchaseDrawer;
