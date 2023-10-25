import React, { useState, useEffect } from 'react';
import {
  Box, Stack, TableCell, TableRow, Divider, Grid, Tooltip
} from '@mui/material';
import { debounce, difference, camelCase } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';
// component
import Button from '../../../../components/button/index';
import CheckBox from '../../../../components/checkbox/index';
import LoaderWrapper from '../../../../components/loader/index';
import MultipleSelect from '../../../../components/multipleCheckbox/index';
import OpenOps from './drawers/openOps';
import PurchaseDrawer from './drawers/purchase';
import Pagination from '../../../../components/pagination/index';
import SearchInput from '../../../../components/searchInput/index';
import Table from '../../../../components/ag-grid-table/index';
import HoverImage from '../../../../components/imageTooltip';

import {
  GetQueueItems,
  SetPoQueueItemState,
  SaveSelectedQueueItemsId,
  DownloadQueueItems,
  SetPurchaseOrderState,
  SetPaymentDetailState
} from '../../../../redux/slices/purchasing';

// images
import Product from '../../../../static/images/no-product-image.svg';
import noData from '../../../../static/images/no-data-table.svg';

import { GetS3ImageUrl } from '../../../../../utils/helpers';

import { addItemHeader, addItemToQueueSort } from '../../../../constants/index';
import ProductHeaderWrapper from '../../products/style';

const AddItem = () => {
  const dispatch = useDispatch();

  const {
    user
  } = useSelector((state) => state.auth);

  const {
    getQueueItemsLoading,
    loading,
    success,
    addItemsToQueueFilters,
    addItemsToQueuePageLimit,
    addItemsToQueuePageNumber,
    queueItems,
    totalQueueItems,
    saveSelectedQueueItemsParams,
    queueItemsDownloaded
  } = useSelector((state) => state.poQueueItem);

  const [multiSelectOptions, setMultiSelectOptions] = useState([
    'Items on BackOrder',
    'Suggestions',
    'Items on Orders'
  ]);
  const [itemPurchaseHistoryModal, setItemPurchaseHistoryModal] = useState(false);
  const [openOps, setOpenOps] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [selectedQueueItemsForDownload, setSelectedQueueItemsForDownload] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [queueItemIds, setQueueItemIds] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState({
    title: '',
    stockNumber: '',
    mfgPartNo: '',
    supplier: '',
    primaryImageUrl: ''
  });
  const [queueItemsData, setQueueItemsData] = useState([]);

  const [sortValue, setSortValue] = useState({});

  const getQueueItems = () => {
    const skip = (addItemsToQueuePageNumber - 1) * addItemsToQueuePageLimit;
    const limit = addItemsToQueuePageLimit;

    dispatch(GetQueueItems({
      skip,
      limit,
      filters: addItemsToQueueFilters,
      sortBy: sortValue
    }));
  };

  const createData = (
    _id,
    image,
    title,
    primaryUpc,
    stockNumber,
    mfgPartNo,
    supplier,
    cost,
    price,
    stock,
    fba,
    backOrder,
    reserved,
    onOrder,
    location,
    action
  ) => ({
    _id,
    image,
    title,
    primaryUpc,
    stockNumber,
    mfgPartNo,
    supplier,
    cost,
    price,
    stock,
    fba,
    backOrder,
    reserved,
    onOrder,
    location,
    action
  });

  const handleHeaderCheckBoxClicked = (e) => {
    const allSupplierIds = queueItems.map((item) => (item._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      setSelectedQueueItemsForDownload([...selectedQueueItemsForDownload, ...allSupplierIds]);
    } else {
      const filteredId = selectedQueueItemsForDownload.filter(
        (id) => !allSupplierIds.includes(id)
      );

      setHeaderCheckBox(false);
      setSelectedQueueItemsForDownload(filteredId);
    }
  };

  const handleCheckBoxClick = (e, queueItemId) => {
    if (e.target.checked) {
      setSelectedQueueItemsForDownload([
        ...selectedQueueItemsForDownload,
        queueItemId
      ]);

      selectedQueueItemsForDownload.includes();
    } else {
      const queueItemIdsList = selectedQueueItemsForDownload.filter((id) => id !== queueItemId);
      setSelectedQueueItemsForDownload([...queueItemIdsList]);
    }
  };

  const handleDownloadClickEvent = () => {
    if (selectedQueueItemsForDownload.length) {
      dispatch(SaveSelectedQueueItemsId({ selectIds: selectedQueueItemsForDownload }));
    }
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handlePageNumber = (e) => {
    dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageNumber', value: e }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageNumber', value: 1 }));
    dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageLimit', value: e }));
  };

  const handleSearch = debounce((e) => {
    const { value, name: key } = e.target;
    dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageNumber', value: 1 }));
    dispatch(SetPoQueueItemState({
      field: 'addItemsToQueueFilters',
      value: {
        ...addItemsToQueueFilters,
        searchByKeyWords: {
          ...addItemsToQueueFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleMultipleSelector = (e) => {
    dispatch(SetPoQueueItemState({
      field: 'addItemsToQueueFilters',
      value: {
        ...addItemsToQueueFilters,
        extendedFilters: e.target.value
      }
    }));
  };

  const handleClickItemPurchaseHistory = (row) => {
    setSelectedProductId(row._id);
    setSelectedSupplierId(row.supplier?._id);
    setSelectedQueueItem({
      title: row.title,
      stockNumber: row.stockNumber,
      mfgPartNo: row.mfgPartNo,
      supplier: row.supplier?.code,
      primaryImageUrl: row.images?.primaryImageUrl
    });
    setItemPurchaseHistoryModal(true);
  };

  const handleItemPurchaseHistoryDrawerClose = () => {
    setItemPurchaseHistoryModal(false);
    setSelectedProductId(null);
    setSelectedSupplierId(null);
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
    if (saveSelectedQueueItemsParams) {
      const { userId } = user;
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      dispatch(DownloadQueueItems({ userId: userIdData }));
      dispatch(SetPoQueueItemState({ field: 'saveSelectedQueueItemsParams', value: false }));
    }
  }, [saveSelectedQueueItemsParams]);

  useEffect(() => {
    if (queueItemsDownloaded) {
      setSelectedQueueItemsForDownload([]);
      dispatch(SetPoQueueItemState({ field: 'queueItemsDownloaded', value: false }));
    }
  }, [queueItemsDownloaded]);

  useEffect(() => {
    if (difference(queueItemIds, selectedQueueItemsForDownload).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedQueueItemsForDownload]);

  useEffect(() => {
    if (queueItems?.length) {
      const queueItemsList = queueItems.map((row) => (
        createData(
          row?._id,
          row?.images?.primaryImageUrl,
          row?.title,
          row?.primaryUpc,
          row?.stockNumber,
          row?.mfgPartNo || '--',
          row?.supplier?.code || '--',
          `${row?.currencyCostPriceSymbol && row?.currencyCostPriceSymbol !== ''
            ? row.currencyCostPriceSymbol : '$'}${Number(row?.costPrice || 0)?.toFixed(2)}`,
          `${row?.currencySalePriceSymbol && row?.currencySalePriceSymbol !== ''
            ? row.currencySalePriceSymbol : '$'}${Number(row?.salePrice || 0)?.toFixed(2)}`,
          row?.quantityInStock || '--',
          row?.fbaQuantity || '--',
          row?.backOrderQuantity || '--',
          row?.reservedQuantity || '--',
          row?.onOrderQuantity || '--',
          row?.location || '--',
          <Box
            className="icon-left-arrow pointer "
            onClick={() => handleClickItemPurchaseHistory(row)}
          />
        )
      ));
      setQueueItemsData(queueItemsList);
    } else {
      dispatch(SetPoQueueItemState({ field: 'getQueueItemsLoading', value: false }));
      setQueueItemsData([]);
    }
  }, [queueItems]);

  useEffect(() => {
    if (queueItemsData.length > 0) {
      dispatch(SetPoQueueItemState({ field: 'getQueueItemsLoading', value: false }));
    }
  }, [queueItemsData]);

  useEffect(() => {
    if (queueItems?.length) {
      const queueItemsIdList = queueItems.map((row) => (row._id));
      setQueueItemIds(queueItemsIdList);

      if (difference(queueItemsIdList, selectedQueueItemsForDownload).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setHeaderCheckBox(false);
      setQueueItemIds([]);
    }
  }, [queueItems]);

  useEffect(() => {
    setSearchByTitle(addItemsToQueueFilters?.searchByKeyWords?.title || '');
    setSearchByStockNumber(addItemsToQueueFilters?.searchByKeyWords?.stockNumber || '');
    setSearchByMfgNumber(addItemsToQueueFilters?.searchByKeyWords?.mfgPartNo || '');
  }, []);

  useEffect(() => {
    setHeaderCheckBox(false);
    getQueueItems();
  }, [addItemsToQueuePageNumber, addItemsToQueuePageLimit, addItemsToQueueFilters, sortValue]);

  useEffect(() => () => {
    dispatch(SetPoQueueItemState({ field: 'queueItems', value: [] }));
    if (!window.location.pathname.includes('/purchasing')) {
      dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageNumber', value: 1 }));
      dispatch(SetPoQueueItemState({ field: 'addItemsToQueuePageLimit', value: 100 }));
      dispatch(SetPoQueueItemState({
        field: 'addItemsToQueueFilters',
        value: {
          searchByKeyWords: {
            title: '',
            stockNumber: '',
            mfgPartNo: ''
          },
          extendedFilters: []
        }
      }));

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
    }
    setSelectedQueueItem({
      title: '',
      stockNumber: '',
      mfgPartNo: '',
      supplier: '',
      primaryImageUrl: ''
    });
  }, []);

  return (
    <>
      <ProductHeaderWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box component="h2" pt={0.25}>Add Item To Queue</Box>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
          <MultipleSelect
            values={multiSelectOptions}
            vertical
            placeholder="Select"
            value={addItemsToQueueFilters.extendedFilters}
            width={177}
            name="extendedFilters"
            label="Extended Filter:"
            onChange={handleMultipleSelector}
            checkedList={addItemsToQueueFilters.extendedFilters}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Title"
            name="title"
            width="176px"
            value={searchByTitle}
            onChange={(e) => {
              setSearchByTitle(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Stock #"
            width="162px"
            name="stockNumber"
            value={searchByStockNumber}
            onChange={(e) => {
              setSearchByStockNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by MFG Stock #"
            width="182px"
            name="mfgPartNo"
            value={searchByMfgNumber}
            onChange={(e) => {
              setSearchByMfgNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <Button
            startIcon={<span className="icon-download" />}
            className="icon-button"
            disabled={!selectedQueueItemsForDownload.length}
            onClick={handleDownloadClickEvent}
          />
        </Box>
      </Box>
      </ProductHeaderWrapper>
      <Box mt={2.375}>
        <Table
          checkbox
          fixed
          tableHeader={addItemHeader}
          height="204px"
          bodyPadding="8px 12px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          key="addItemToQueueHeader"
          sortableHeader={addItemToQueueSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getQueueItemsLoading ? <LoaderWrapper /> : null }
          {queueItemsData.length ? queueItemsData?.map((row) => (
            <TableRow
              hover
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row" style={{ minWidth: 250, width: '22%' }}>
                <Box component="span" display="flex" alignItems="center" gap={1.5}>
                  <CheckBox
                    key={row._id}
                    marginBottom="0"
                    className="body-checkbox"
                    checked={selectedQueueItemsForDownload.includes(String(row._id))}
                    onClick={(e) => handleCheckBoxClick(e, row._id)}
                  />
                  <Stack direction="row" spacing={1}>
                    {row?.image
                      ? (
                        <HoverImage
                          image={GetS3ImageUrl({
                            bucketName: 'productImage', key: row?.image
                          })}
                          onError={(e) => handleImageError(e, Product)}
                        >
                          <img
                            width={40}
                            height={40}
                            alt=""
                            onError={(e) => handleImageError(e, Product)}
                            src={GetS3ImageUrl({
                              bucketName: 'productImage', key: row?.image
                            })}
                          />
                        </HoverImage>
                      ) : (
                        <img
                          width={40}
                          height={40}
                          alt=""
                          onError={(e) => handleImageError(e, Product)}
                          src={Product}
                        />
                      )}
                    <Box>
                      <Box
                        component="span"
                        className="product-name-clamp"
                      >
                        {row?.title?.length > 30
                          ? (
                            <Tooltip
                              placement="top-start"
                              arrow
                              title={row?.title}
                            >
                              <span>
                                {row?.title}
                              </span>
                            </Tooltip>
                          )
                          : (
                            <span>
                              {row?.title || '--'}
                            </span>
                          )}
                      </Box>
                      <Stack spacing={1} direction="row" fontSize="10px">
                        <Box component="span" color="#979797">
                          UPC:
                          <Box component="span" color="#5A5F7D" ml={0.3}>{row?.primaryUpc || '--'}</Box>
                        </Box>
                        <Box component="span" color="#979797">
                          Stock Number:
                          <Box component="span" color="#5A5F7D" ml={0.3}>{row?.stockNumber || '--'}</Box>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </TableCell>
              <TableCell>{row.mfgPartNo}</TableCell>
              <TableCell>{row.supplier}</TableCell>
              <TableCell>{row.cost}</TableCell>
              <TableCell>{row.price}</TableCell>
              <TableCell>{row.stock}</TableCell>
              <TableCell>{row.fba}</TableCell>
              <TableCell>{row.backOrder}</TableCell>
              <TableCell>{row.reserved}</TableCell>
              <TableCell>{row.onOrder}</TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell align="right">{row.action}</TableCell>
            </TableRow>
          ))
            : (
              !getQueueItemsLoading
            && totalQueueItems === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={16} align="center">
                  <Box
                    textAlign="center"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="calc(100vh - 315px)"
                  />
                </TableCell>
              </TableRow>
              )
            )}
        </Table>

        <Pagination
          perPageRecord={queueItems?.length || 0}
          componentName="purchasing"
          total={totalQueueItems}
          totalPages={Math.ceil(totalQueueItems / addItemsToQueuePageLimit)}
          offset={totalQueueItems}
          pageNumber={addItemsToQueuePageNumber}
          pageLimit={addItemsToQueuePageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
          width="0px"
        />
      </Box>
      <PurchaseDrawer
        open={itemPurchaseHistoryModal}
        openAnotherDrawer={() => setOpenOps(true)}
        onClose={() => handleItemPurchaseHistoryDrawerClose()}
        productId={selectedProductId}
        supplierId={selectedSupplierId}
        queueItem={selectedQueueItem}
        setSelectedSupplierId={setSelectedSupplierId}
      />
      <OpenOps
        open={openOps}
        onCloseModal={() => setItemPurchaseHistoryModal(false)}
        onClose={() => setOpenOps(false)}
        productId={selectedProductId}
        supplierId={selectedSupplierId}
      />
    </>
  );
};

export default AddItem;
