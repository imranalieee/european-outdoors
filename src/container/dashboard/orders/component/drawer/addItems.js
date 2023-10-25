import React, { useState, useEffect } from 'react';
import {
  Box, Stack, TableRow, TableCell, Tooltip
} from '@mui/material';
import { debounce, difference, isEmpty, camelCase } from 'lodash';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import { RemoveRedEye } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// components
import Drawer from '../../../../../components/drawer';
import SearchInput from '../../../../../components/searchInput';
import Checkbox from '../../../../../components/checkbox';
import Button from '../../../../../components/button';
import Table from '../../../../../components/ag-grid-table';
import HoverImage from '../../../../../components/imageTooltip';
import Pagination from '../../../../../components/pagination/index';
import Popover from '../../../../../components/popover/index';
// redux
import {
  AddOrderItems,
  GetItemsForAnOrder,
  SetOrderState
} from '../../../../../redux/slices/order';
import { GetPackItems, SetPackState } from '../../../../../redux/slices/pack-slice';
import LoaderWrapper from '../../../../../components/loader';
// helper
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
import Product from '../../../../../static/images/no-product-image.svg';
// constants
import { addOrderItemHeader, addOrderItemHeaderSort, packComponentHeader } from '../../../../../constants';
// images
import noDataImg from '../../../../../static/images/no-data-table.svg';

const OrderNo = (props) => {
  const { onClose, open } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user: { permissions: { editOrders = false } = {} }
  } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    searchByKeyWords: {
      title: '',
      stockNumber: '',
      mfgPartNo: '',
      primaryUpc: ''
    }
  });

  const {
    newOrderId,
    addItems,
    getItemsForAnOrderLoading,
    totalAddItems,
    addItemsInOrderLoading,
    success,
    itemsAdded
  } = useSelector((state) => state.order);

  const {
    loading: packLoading,
    totalItemsInPack,
    packItems,
    packDetailProductId: packProductId
  } = useSelector((state) => state.pack);

  const [addItemsList, setAddItemsList] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [searchByPrimaryUpc, setSearchByPrimaryUpc] = useState('');
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [selectedOrdersForAddItems, setSelectedOrdersForAddItems] = useState([]);
  const [addOrderItemsIds, setAddOrderItemsIds] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [packDetailsData, setPackDetailsData] = useState([]);
  const [packDetailProductId, setPackDetailProductId] = useState(null);
  const [packItemPagination, setPackItemPagination] = useState({
    pageLimit: 2,
    pageNumber: 1
  });

  let modalOpen = false;
  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'simple-popover' : undefined;

  const [sortValue, setSortValue] = useState({});

  const createPackData = (
    _id,
    product,
    mfgPartNo,
    qtyInPack,
    quantityInStock,
    costPriceValue,
    addedBy,
    action
  ) => ({
    _id,
    product,
    mfgPartNo,
    qtyInPack,
    quantityInStock,
    costPrice: costPriceValue,
    addedBy,
    action
  });

  function OrderedCreateData(
    _id,
    primaryImageUrl,
    title,
    primaryUpc,
    stockNumber,
    mfgPartNo,
    costPrice,
    salePrice,
    supplier,
    isPacked,
    quantityInStock,
    location,
    action
  ) {
    return {
      _id,
      primaryImageUrl,
      title,
      primaryUpc,
      stockNumber,
      mfgPartNo,
      costPrice,
      salePrice,
      supplier,
      isPacked,
      quantityInStock,
      location,
      action
    };
  }

  const getItemsForAddOrder = () => {
    const skip = (pageNumber - 1) * pageLimit;

    const limit = pageLimit;
    dispatch(GetItemsForAnOrder({
      skip,
      limit,
      filters,
      orderId: newOrderId,
      sortBy: sortValue
    }));
  };

  const handlePackImageError = (event, image) => {
    event.target.src = image;
  };

  const handleAnchorElClose = () => {
    setTimeout(() => {
      if (!modalOpen) {
        setAnchorEl(null);
      }
    }, 0);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handleSearch = debounce((e) => {
    const { value, name: key } = e.target;
    setPageNumber(1);
    setFilters({
      ...filters,
      searchByKeyWords: {
        ...filters.searchByKeyWords,
        [key]: value
      }
    });
  }, 500);

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handleCheckBoxClick = (e, prodId) => {
    if (e.target.checked) {
      setSelectedOrdersForAddItems([
        ...selectedOrdersForAddItems,
        prodId
      ]);
    } else {
      const ordersIdList = selectedOrdersForAddItems.filter((id) => id !== prodId);
      setSelectedOrdersForAddItems([...ordersIdList]);
    }
  };

  const handleHeaderCheckBoxClicked = (e) => {
    const allOrderIds = addItems.map((order) => (order._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      setSelectedOrdersForAddItems([...selectedOrdersForAddItems, ...allOrderIds]);
    } else {
      const filteredId = selectedOrdersForAddItems.filter(
        (id) => !allOrderIds.includes(id)
      );

      setHeaderCheckBox(false);
      setSelectedOrdersForAddItems(filteredId);
    }
  };

  const handleClose = () => {
    setFilters({
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: '',
        primaryUpc: ''
      }
    });
    onClose();
    setSearchByStockNumber('');
    setSearchByMfgNumber('');
    setSearchByPrimaryUpc('');
    setSearchByTitle('');
    setHeaderCheckBox(false);
    setSelectedOrdersForAddItems([]);
    dispatch(SetPackState({ field: 'packDetailProductId', value: null }));
    dispatch(SetPackState({ field: 'totalItemsInPack', value: 0 }));
    dispatch(SetPackState({ field: 'packItems', value: [] }));
    dispatch(SetOrderState({ field: 'addItems', value: [] }));
    dispatch(SetOrderState({ field: 'totalAddItems', value: 0 }));
  };

  const handleAddSingleItem = (id) => {
    handleClose();
    dispatch(AddOrderItems({
      orderItemsIdList: [id],
      orderId: newOrderId
    }));
  };

  const handleSaveAddOrderItems = () => {
    if (selectedOrdersForAddItems.length) {
      handleClose();
      dispatch(AddOrderItems({
        orderItemsIdList: selectedOrdersForAddItems,
        orderId: newOrderId
      }));
    }
  };

  const handleViewPackItemsClick = (event, prodId) => {
    if (packProductId !== prodId) {
      dispatch(SetPackState({ field: 'packItems', value: [] }));
      dispatch(SetPackState({ field: 'packDetailProductId', value: prodId }));
      setPackItemPagination({
        pageNumber: 1,
        pageLimit: 2
      });
      setPackDetailProductId(prodId);
    }
    setAnchorEl(event.currentTarget);
  };

  const getPackItems = () => {
    const {
      pageLimit: packDetailsPageLimit,
      pageNumber: packDetailsPageNumber
    } = packItemPagination;

    const skip = (packDetailsPageNumber - 1) * packDetailsPageLimit;
    const limit = packDetailsPageLimit;

    dispatch(
      GetPackItems({
        productId: packDetailProductId
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
    if (packItems.length) {
      const packItemsData = packItems.map((row) => createPackData(
        row._id,
        <Stack direction="row" spacing={1}>
          <Box sx={{ '&:hover': 'transform: scale(1.5)' }}>
            {row?.itemId?.images?.primaryImageUrl
              ? (
                <HoverImage
                  image={GetS3ImageUrl({
                    bucketName: 'productImage', key: row?.itemId?.images?.primaryImageUrl
                  })}
                  onError={(e) => handleImageError(e, Product)}
                >
                  <img
                    width={32}
                    height={32}
                    alt=""
                    onError={(e) => handlePackImageError(e, Product)}
                    src={GetS3ImageUrl({
                      bucketName: 'productImage', key: row?.itemId?.images?.primaryImageUrl
                    })}
                  />
                </HoverImage>
              ) : (
                <img
                  width={32}
                  height={32}
                  alt=""
                  onError={(e) => handlePackImageError(e, Product)}
                  src={Product}
                />
              )}
          </Box>
          <Box>
            <Box
              component="span"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              maxWidth="250px"
              display="block"
            >
              <Box className="product-name-clamp" component="span">
                {row.itemId?.title?.length > 30 ? (
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={row.itemId?.title}
                  >
                    <span>
                      {row.itemId?.title?.length > 30
                        ? row.itemId?.title
                        : row.itemId?.title}
                    </span>
                  </Tooltip>
                ) : (
                  <span>
                    {row.itemId?.title?.length > 30
                      ? row.itemId?.title
                      : row.itemId?.title || '--'}
                  </span>
                )}
              </Box>
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.itemId?.primaryUpc || '--'}
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.itemId?.stockNumber || '--'}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        row?.itemId?.mfgPartNo || '--',
        row?.quantity || 0,
        row?.itemId?.quantityInStock || '--',
        row?.itemId?.costPrice ? `$${+(row.itemId.costPrice).toFixed(2)}` : '$0.00',
        row?.userId?.name ? row?.userId?.name : '--',
        <Box display="flex" gap={2}>
          <RemoveRedEye
            sx={{ color: '#3C76FF', width: 16 }}
            className="pointer"
            onClick={() => navigate(`/products/${row?.itemId._id}`)}
          />
        </Box>
      ));
      setPackDetailsData(packItemsData);
    } else {
      setPackDetailsData([]);
    }
  }, [packItems]);

  useEffect(() => {
    if (!isEmpty(packDetailProductId)) {
      getPackItems();
    }
  }, [packDetailProductId, packItemPagination]);

  // useEffect(() => {
  //   if (success && !addItemsInOrderLoading && itemsAdded) {
  //     setSelectedOrdersForAddItems([]);
  //     // close modal
  //     handleClose();
  //   }
  // }, [success, addItemsInOrderLoading]);

  useEffect(() => {
    if (difference(addOrderItemsIds, selectedOrdersForAddItems).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedOrdersForAddItems]);

  // useEffect(() => {
  //   if (addItems.length) {
  //     // const orderItemsData = addItems.map((row) => (
  //       // OrderedCreateData(
  //       //   row._id,
  //       //   row?.images?.primaryImageUrl,
  //       //   row.title,
  //       //   row?.primaryUpc,
  //       //   row?.stockNumber,
  //       //   row?.mfgPartNo || '--',
  //       //   row.costPrice ? `$${Number(row.costPrice)?.toFixed(2)}` : '$0.00',
  //       //   row.salePrice ? `$${Number(row.salePrice)?.toFixed(2)}` : '$0.00',
  //       //   row?.supplierCode || '--',
  //       //   row?.isPacked,
  //       //   row?.quantityInStock || '--',
  //       //   row?.location || '--',
  //       //   <Box
  //       //     onClick={() => handleAddSingleItem(row._id)}
  //       //   >
  //       //     <AddCircleOutlineOutlinedIcon className="pointer" sx={{ color: '#3C76FF', fontSize: '16px' }} />
  //       //   </Box>
  //       // )));

  //     // setAddItemsList(orderItemsData);
  //   } else {
  //     setAddItemsList([]);
  //   }
  // }, [addItems]);

  useEffect(() => {
    if (addItems.length) {
      const addItemsIdList = addItems.map((row) => (row._id));
      setAddOrderItemsIds(addItemsIdList);

      if (difference(addItemsIdList, selectedOrdersForAddItems).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setHeaderCheckBox(false);
    }
  }, [addItems]);

  useEffect(() => {
    if (open) getItemsForAddOrder();
  }, [open, filters, pageNumber, pageLimit, sortValue]);

  return (
    <Drawer open={open} width="1144px" close={handleClose}>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Box component="span" className="icon-left pointer" onClick={handleClose} />
          <h2 className="m-0 pl-2">Add Items</h2>
        </Box>
        <Box display="flex" gap="14px">
          <SearchInput
            autoComplete="off"
            placeholder="Search by Title"
            width="165px"
            name="title"
            value={searchByTitle}
            onChange={(e) => {
              setSearchByTitle(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by UPC"
            width="165px"
            name="primaryUpc"
            value={searchByPrimaryUpc}
            onChange={(e) => {
              setSearchByPrimaryUpc(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Stock #"
            width="165px"
            name="stockNumber"
            value={searchByStockNumber}
            onChange={(e) => {
              setSearchByStockNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by MFG Part #"
            width="192px"
            name="mfgPartNo"
            value={searchByMfgNumber}
            onChange={(e) => {
              setSearchByMfgNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <Button
            disabled={!selectedOrdersForAddItems?.length || !editOrders}
            text="Selected items"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => { onClose(); handleSaveAddOrderItems(); }}
          />
        </Box>
      </Box>
      <Box mt={3}>
        <Table
          checkbox
          tableHeader={addOrderItemHeader}
          height="115px"
          bodyPadding="8px 12px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          key="addItemToOrderHeader"
          sortableHeader={addOrderItemHeaderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getItemsForAnOrderLoading ? <LoaderWrapper /> : null}
          { addItems.length ? addItems.map((row) => (
            <TableRow
              hover
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Box component="span" display="flex" alignItems="center" gap={1.5}>
                  <Checkbox
                    key={row._id}
                    marginBottom="0"
                    className="body-checkbox"
                    checked={selectedOrdersForAddItems?.includes(String(row._id))}
                    onClick={(e) => handleCheckBoxClick(e, row._id)}
                  />
                  <Stack direction="row" spacing={1}>
                    {row?.primaryImageUrl
                      ? (
                        <HoverImage
                          image={GetS3ImageUrl({
                            bucketName: 'productImage', key: row?.primaryImageUrl
                          })}
                          onError={(e) => handleImageError(e, Product)}
                        >
                          <img
                            width={40}
                            height={40}
                            onError={(e) => handleImageError(e, Product)}
                            src={GetS3ImageUrl({
                              bucketName: 'productImage', key: row?.primaryImageUrl
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
                        sx={{
                          textOverflow: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}
                        maxWidth="250px"
                        display="block"
                      >
                        <Box className="product-name-clamp" component="span">

                          {row.title?.length > 30
                            ? (
                              <Tooltip
                                    placement="top-start"
                                    arrow
                                    title={row.title}
                                  >
                                    <span>
                                      {row.title}
                                    </span>
                                  </Tooltip>
                            )
                            : (
                              <span>
                                    {row.title || '--'}
                                  </span>
                            )}
                        </Box>
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
              <TableCell>{row.mfgPartNo || '--'}</TableCell>
              <TableCell>{`$${Number(row.costPrice).toFixed(2)}` || '$0.00'}</TableCell>
              <TableCell>{`$${Number(row.salePrice).toFixed(2)}` || '$0.00' }</TableCell>
              <TableCell>{row.supplierCode || '--'}</TableCell>
              <TableCell>
                <Box>
                  {row?.isPacked
                    ? (
                      <CheckCircleIcon
                        aria-describedby={id}
                        onMouseEnter={(e) => handleViewPackItemsClick(e, row._id)}
                        onMouseLeave={handleAnchorElClose}
                        sx={{
                          color: '#0FB600',
                          width: 16
                        }}
                      />
                    )
                    : (
                      <CheckCircleOutlinedIcon
                        sx={{ color: '#979797', fontSize: 16 }}
                      />
                    )}
                </Box>
              </TableCell>
              <TableCell>{row.quantityInStock || '--'}</TableCell>
              <TableCell>{row.location || '--'}</TableCell>
              <TableCell align="right">
                <Box
                  onClick={() => { onClose(); handleAddSingleItem(row._id); }}
                >
                  <AddCircleOutlineOutlinedIcon className="pointer" sx={{ color: '#3C76FF', fontSize: '16px' }} />
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            !getItemsForAnOrderLoading && totalAddItems === 0 && (
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
            )
          )}
        </Table>
        <Pagination
          position="relative"
          width="0"
          perPageRecord={addItems?.length || 0}
          componentName="orders"
          total={totalAddItems}
          totalPages={Math.ceil(totalAddItems / pageLimit)}
          offset={totalAddItems}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />

        <Popover
          className="approve-popover"
          id={id}
          open={openPopover}
          anchorEl={anchorEl}
          onMouseEnter={() => {
            modalOpen = true;
          }}
          onMouseLeave={() => {
            modalOpen = false;
            handleAnchorElClose();
          }}
          onClose={() => handleAnchorElClose()}
          title="Pack Details"
        >

          <Table
            className="approve-table"
            alignCenter
            tableHeader={packComponentHeader}
            bodyPadding="8px 11px"
          >
            {
            packLoading
              ? <LoaderWrapper />
              : packDetailsData?.length ? packDetailsData.map((row) => (
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
                      {row.product}
                    </Box>
                  </TableCell>
                  <TableCell>{row.mfgPartNo}</TableCell>
                  <TableCell>{row.qtyInPack}</TableCell>
                  <TableCell>{row.quantityInStock}</TableCell>
                  <TableCell>{row.costPrice}</TableCell>
                  <TableCell>{row.addedBy}</TableCell>
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              )) : (
                !packLoading && totalItemsInPack === 0 && (
                  null
                )
              )
          }
          </Table>
          {/* <Pagination
            componentName="products"
            position="relative"
            width="0"
            perPageRecord={packItems?.length || 0}
            total={totalItemsInPack}
            totalPages={Math.ceil(totalItemsInPack / packItemPagination.pageLimit)}
            offset={totalItemsInPack}
            pageNumber={packItemPagination.pageNumber}
            pageLimit={packItemPagination.pageLimit}
            handlePageLimitChange={handlePackDetailsPageLimit}
            handlePageNumberChange={handlePackDetailsPageNumber}
          /> */}
        </Popover>

      </Box>
    </Drawer>
  );
};

export default OrderNo;
