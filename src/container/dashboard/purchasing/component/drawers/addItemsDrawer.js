import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stack, TableCell, TableRow, Tooltip
} from '@mui/material';
import {
  debounce, uniq, difference, isEmpty, uniqBy, camelCase
} from 'lodash';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// components
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
import Button from '../../../../../components/button/index';
import SearchInput from '../../../../../components/searchInput/index';
import CheckBox from '../../../../../components/checkbox/index';
import Pagination from '../../../../../components/pagination/index';
import HoverImage from '../../../../../components/imageTooltip';
// images
import Product from '../../../../../static/images/no-product-image.svg';
import LoaderWrapper from '../../../../../components/loader/index';
import noData from '../../../../../static/images/no-data-table.svg';
// redux
import {
  GetItemsOfSupplierForNonConfirmPO,
  AddItemsToNonConfirmPO,
  SetPurchaseOrderState
} from '../../../../../redux/slices/purchasing';
// helpers
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
// constant
import { addItemsHeader, nonConfirmAddItemsHeaderSort } from '../../../../../constants/index';

const PurchaseDrawer = (props) => {
  const {
    open, onClose, supplier, poId
  } = props;
  const dispatch = useDispatch();
  const {
    supplierItems,
    totalSupplierItems,
    supplierItemsPageLimit,
    supplierItemsPageNumber,
    itemsOfSupplierFilters,
    loading,
    itemAddedToNonConfirmPO
  } = useSelector((state) => state.purchaseOrder);
  const [localSupplierItems, setLocalSupplierItems] = useState([]);
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [selectedSupplierItems, setSelectedSupplierItems] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [supplierItemIds, setSupplierItemIds] = useState([]);
  const [totalItems, setTotalItems] = useState([]);

  const [sortValue, setSortValue] = useState({});

  function createPosData(
    payment,
    amount,
    user,
    date,
    transaction,
    cheque,
    card,
    paypal,
    action
  ) {
    return {
      payment,
      amount,
      user,
      date,
      transaction,
      cheque,
      card,
      paypal,
      action
    };
  }
  const posData = [];
  for (let i = 0; i <= 20; i += 1) {
    posData.push(
      createPosData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img
              width={40}
              height={40}
              src={Product}
              alt=""
            />
          </HoverImage>

          <Box>
            <Box
              component="span"
              sx={{
                textOverfow: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}
              maxWidth="250px"
              display="block"
            >
              Rapido Boutique Collection
              Flipper Open Heel Adjustable Fin - LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>194773048809</Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>RQFA68-PR-S/M</Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        ' FA68-ATL-FA683492',
        '$10.43 ',
        '$58.00',
        'ATL-Q',
        <Box>
          <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
          {/* <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} /> */}
        </Box>,
        '438',
        'F16-101',
        <Box><AddCircleOutlineOutlinedIcon sx={{ color: '#3C76FF', fontSize: '16px' }} /></Box>
      )
    );
  }

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

  const getSupplierItems = () => {
    let skip = (supplierItemsPageNumber - 1) * supplierItemsPageLimit;
    if (totalSupplierItems === supplierItemsPageLimit) {
      skip = 0;
    }
    const limit = supplierItemsPageLimit;
    dispatch(GetItemsOfSupplierForNonConfirmPO({
      skip,
      limit,
      supplierId: supplier?._id,
      poId,
      filters: itemsOfSupplierFilters,
      sortBy: sortValue
    }));
  };

  const addItemsToNonConfirmPO = (selectItem = {}) => {
    if (!isEmpty(selectItem)) {
      const addSingleItem = {
        productId: selectItem?.productId,
        purchaseOrderId: poId,
        supplierId: selectItem?.supplierId
      };
      if (selectedSupplierItems?.location?._id) {
        addSingleItem.locationId = selectedSupplierItems?.location?._id;
      }
      dispatch(AddItemsToNonConfirmPO({
        items: [addSingleItem]
      }));
    }
    if (isEmpty(selectItem) && selectedSupplierItems?.length) {
      const filterSupplierItems = totalItems
        ?.filter((item) => selectedSupplierItems.includes(item._id));
      const addMultipleItems = filterSupplierItems?.map((item) => {
        if (item?.location?._id) {
          return {
            productId: item?.productId,
            purchaseOrderId: poId,
            supplierId: item?.supplierId,
            locationId: item?.location?._id
          };
        }
        return {
          productId: item?.productId,
          purchaseOrderId: poId,
          supplierId: item?.supplierId

        };
      });
      dispatch(AddItemsToNonConfirmPO({
        items: addMultipleItems
      }));
    }
    onClose();
  };

  const handlePageNumber = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageNumber', value: e
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageLimit', value: e
    }));
  };

  const handleSearch = debounce((e) => {
    const { value, name: key } = e.target;
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'itemsOfSupplierFilters',
      value: {
        ...itemsOfSupplierFilters,
        searchByKeyWords: {
          ...itemsOfSupplierFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleHeaderCheckBoxClicked = (e) => {
    const allSupplierItemId = localSupplierItems?.map((item) => (item?._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      const allPOItems = selectedSupplierItems.concat(allSupplierItemId);
      const uniqItems = uniq(allPOItems);
      setSelectedSupplierItems(uniqItems);
    } else {
      const filteredId = selectedSupplierItems.filter(
        (id) => !allSupplierItemId.includes(id)
      );

      setHeaderCheckBox(false);
      const uniqItems = uniq(filteredId);
      setSelectedSupplierItems(uniqItems);
    }
  };

  const handleCheckBoxClick = (e, selectedItemId) => {
    if (e.target.checked) {
      setSelectedSupplierItems([
        ...selectedSupplierItems,
        selectedItemId
      ]);

      selectedSupplierItems.includes();
    } else {
      const queueItemIdsList = selectedSupplierItems.filter((id) => id !== selectedItemId);
      const uniqItems = uniq(queueItemIdsList);
      setSelectedSupplierItems([...uniqItems]);
    }
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  useEffect(() => {
    if (supplierItems?.length) {
      const uniqueData = uniqBy(supplierItems, (obj) => obj?._id);
      setLocalSupplierItems(uniqueData);
      const supplierItemsIdList = supplierItems.map((row) => (row._id));
      setSupplierItemIds(supplierItemsIdList);
      const allItems = totalItems.concat(supplierItems);
      const uniqItems = uniqBy(allItems, (obj) => obj?._id);
      setTotalItems(uniqItems);

      if (difference(supplierItemsIdList, selectedSupplierItems).length === 0
        && selectedSupplierItems?.length) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setTotalItems([]);
      setLocalSupplierItems([]);
      setSupplierItemIds([]);
      setSelectedSupplierItems([]);
      setHeaderCheckBox(false);
    }
  }, [supplierItems]);

  useEffect(() => {
    if (difference(supplierItemIds, selectedSupplierItems).length === 0
      && selectedSupplierItems?.length) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedSupplierItems]);

  useEffect(() => {
    setSelectedSupplierItems([]);
  }, [itemAddedToNonConfirmPO]);

  useEffect(() => () => {
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageLimit',
      value: 100
    }));
    dispatch(SetPurchaseOrderState({
      field: 'supplierItemsPageNumber',
      value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'itemsOfSupplierFilters',
      value: {
        searchByKeyWords: {
          title: '',
          stockNumber: '',
          mfgPartNo: ''
        }
      }
    }));
    dispatch(SetPurchaseOrderState({
      field: 'supplierItems',
      value: []
    }));
  }, []);

  useEffect(() => {
    getSupplierItems();
  }, [
    poId,
    supplier,
    supplierItemsPageNumber,
    supplierItemsPageLimit,
    itemsOfSupplierFilters,
    sortValue]);

  return (
    <Drawer
      open={open}
      width="1144px"
      close={() => {
        onClose();
        setSelectedSupplierItems([]);
      }}
    >
      <Box display="flex" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={() => {
              onClose();
              setSelectedSupplierItems([]);
            }}
          />
          <h2 className="m-0 pl-2">Add Items</h2>
        </Stack>
        <Box display="flex" gap={2}>
          <SearchInput
            autoComplete="off"
            placeholder="Search by Title"
            width="176px"
            name="title"
            value={searchByTitle}
            onChange={(e) => {
              setSearchByTitle(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Stock #"
            width="160px"
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
            text="Add Selected items"
            disabled={!selectedSupplierItems?.length}
            padding="4px 17px 4px 15px"
            letterSpacing="0px"
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: '16px' }} />}
            onClick={() => { addItemsToNonConfirmPO(); }}
          />
        </Box>
      </Box>
      <Box mt={24 / 8}>
        {loading || (supplierItems.length > 0 && localSupplierItems.length === 0)
          ? <LoaderWrapper /> : (
            <>
              <Table
                checkbox
                tableHeader={addItemsHeader}
                height="117px"
                bodyPadding="8px 12px"
                isChecked={headerCheckBox}
                handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
                sortableHeader={nonConfirmAddItemsHeaderSort}
                handleSort={handleSortChange}
                sortValue={sortValue}
              >
                {localSupplierItems?.length ? localSupplierItems?.map((row) => (
                  <TableRow
                    hover
                    key={row?._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box component="span" display="flex" alignItems="center" gap={1.5}>
                        <CheckBox
                          marginBottom="0"
                          className="body-checkbox"
                          checked={selectedSupplierItems?.includes(String(row?._id))}
                          onClick={(e) => handleCheckBoxClick(e, row?._id)}
                        />
                        <Stack direction="row" spacing={1}>
                          {row?.product?.images?.primaryImageUrl
                            ? (
                              <HoverImage
                                image={GetS3ImageUrl({
                                  bucketName: 'productImage', key: row?.product?.images?.primaryImageUrl
                                })}
                                onError={(e) => handleImageError(e, Product)}
                              >
                                <img
                                  width={40}
                                  height={40}
                                  onError={(e) => handleImageError(e, Product)}
                                  src={GetS3ImageUrl({
                                    bucketName: 'productImage', key: row?.product?.images?.primaryImageUrl
                                  })}
                                  alt=""
                                />
                              </HoverImage>
                            ) : (
                              <img
                                width={40}
                                height={40}
                                onError={(e) => handleImageError(e, Product)}
                                src={Product}
                                alt=""
                              />
                            )}
                          <Box>
                            <Box
                              component="span"
                              className="product-name-clamp"
                            >
                              {row?.product?.title?.length > 30
                                ? (
                                  <Tooltip
                                    placement="top-start"
                                    arrow
                                    title={row?.product?.title}
                                  >
                                    <span>
                                      {row?.product?.title}
                                    </span>
                                  </Tooltip>
                                )
                                : (
                                  <span>
                                    {row?.product?.title || '--'}
                                  </span>
                                )}
                            </Box>
                            <Stack spacing={1} direction="row" fontSize="10px">
                              <Box component="span" color="#979797">
                                UPC:
                                <Box component="span" color="#5A5F7D" ml={0.3}>
                                  {row?.product?.primaryUpc
                              || '--'}

                                </Box>
                              </Box>
                              <Box component="span" color="#979797">
                                Stock Number:
                                <Box component="span" color="#5A5F7D" ml={0.3}>
                                  {row?.product?.stockNumber
                              || '--'}

                                </Box>
                              </Box>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {row?.product?.mfgPartNo
                  || '--'}

                    </TableCell>
                    <TableCell>
                      $
                      {row?.product?.costPrice
                  || 0}

                    </TableCell>
                    <TableCell>
                      $
                      {row?.product?.salePrice
                  || 0}

                    </TableCell>
                    <TableCell>
                      {supplier?.code
                  || '--'}

                    </TableCell>
                    <TableCell>
                      {row?.product?.quantityInStock
                  || '--'}

                    </TableCell>
                    <TableCell>
                      {row?.location?.name
                  || '--'}

                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <AddCircleOutlineOutlinedIcon
                          onClick={() => {
                            addItemsToNonConfirmPO(row);
                          }}
                          sx={{ color: '#3C76FF', fontSize: '16px', cursor: 'pointer' }}
                        />

                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  !loading && (
                  <TableRow>
                    <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                      <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 200px)">
                        {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Dta" /> */}
                      </Box>
                    </TableCell>
                  </TableRow>
                  )
                )}

              </Table>
              <Pagination
                componentName="purchasing"
                perPageRecord={localSupplierItems?.length || 0}
                total={totalSupplierItems}
                totalPages={Math.ceil(totalSupplierItems / supplierItemsPageLimit)}
                offset={totalSupplierItems}
                pageNumber={supplierItemsPageNumber}
                pageLimit={supplierItemsPageLimit}
                handlePageLimitChange={handlePageLimit}
                handlePageNumberChange={handlePageNumber}
                width="0%"
                position="relative"
              />
            </>
          )}
      </Box>
    </Drawer>
  );
};

export default PurchaseDrawer;
