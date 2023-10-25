import React, { useState, useEffect, useRef } from 'react';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import ReactToPrint from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { RemoveRedEye } from '@mui/icons-material';
import {
  camelCase, difference, isEmpty, lowerCase, startCase
} from 'lodash';
// component
import Button from '../../../../components/button/index';
import Input from '../../../../components/inputs/input';
import Table from '../../../../components/ag-grid-table/index';
import Checkbox from '../../../../components/checkbox';
import Pagination from '../../../../components/pagination';
import HoverImage from '../../../../components/imageTooltip';
import ItemDelete from './modals/delete';
import AddItemsList from './drawer/addItems';
import LoaderWrapper from '../../../../components/loader';
import Popover from '../../../../components/popover/index';
import BarcodeFile from './print/barcodeFile';
// helper
import { GetS3ImageUrl } from '../../../../../utils/helpers';
// redux
import {
  DeleteOrderItemsById,
  GetOrderItems,
  SetOrderNotifyState,
  SetOrderState,
  UpdateOrderItem
} from '../../../../redux/slices/order';
import { GetPackItems, SetPackState } from '../../../../redux/slices/pack-slice';
// images
import Product from '../../../../static/images/no-product-image.svg';

import {
  BADGE_CLASS,
  newOrderedItemHeader,
  REGEX_FOR_NUMBERS,
  REGEX_FOR_DECIMAL_NUMBERS,
  packComponentHeader,
  sortTableByOrderItemsHeader
} from '../../../../constants/index';

const ItemOrdered = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    newOrderId,
    orderItems,
    getOrderItemsLoading,
    totalOrderItems,
    deleteOrderItemLoading,
    itemsDeleted,
    itemsAdded,
    newOrder,
    updateOrderItemLoading
  } = useSelector((state) => state.order);

  const {
    loading: packLoading,
    totalItemsInPack,
    packItems,
    packDetailProductId: packProductId
  } = useSelector((state) => state.pack);

  const [deleteItem, setDeleteItem] = useState(false);
  const [editInput, setEditInput] = useState(false);
  const [addItems, setAddItems] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [orderItemsList, setOrderItemsList] = useState([]);
  const [editItemId, setEditItemId] = useState('');
  const [updateOrderItem, setUpdateOrderItem] = useState({
    quantity: '',
    price: ''
  });
  const [deleteOrderItemId, setDeleteOrderItemId] = useState('');
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [selectedOrdersItems, setSelectedOrdersItems] = useState([]);
  const [orderItemsIds, setOrderItemsIds] = useState([]);
  const [mode, setMode] = useState('');

  const [editItemHelperText, setEditItemHelperText] = useState({
    quantity: '',
    price: ''
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [packDetailsData, setPackDetailsData] = useState([]);
  const [packDetailProductId, setPackDetailProductId] = useState(null);
  const [packItemPagination, setPackItemPagination] = useState({
    pageLimit: 2,
    pageNumber: 1
  });

  const [print, setPrint] = useState(false);
  const [upc, setUpc] = useState('');

  const [localLoading, setLocalLoading] = useState(true);

  const [sortValue, setSortValue] = useState({
    quantityInStock: '',
    quantityOrdered: '',
    unitPrice: '',
    backOrder: '',
    reserved: '',
    onOrder: '',
    rpStock: '',
    fbaUs: '',
    pack: ''
  });

  const [newViewOrderItemsLocalCopy, setNewViewOrderItemsLocalCopy] = useState([]);

  let modalOpen = false;
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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
    orderItemId,
    productId,
    primaryImageUrl,
    title,
    primaryUpc,
    stockNumber,
    mfg,
    quantityInStock,
    orderItemQuantity,
    fulfilledBy,
    committedQuantity,
    backOrderQuantity,
    onOrderQuantity,
    afnFulfillableQuantity,
    reservedQuantity,
    salePrice,
    subTotal,
    relationProductStockNumber,
    relationalProductQuantityInStock,
    status,
    isPacked,
    action
  ) {
    return {
      orderItemId,
      productId,
      primaryImageUrl,
      title,
      primaryUpc,
      stockNumber,
      mfg,
      quantityInStock,
      orderItemQuantity,
      fulfilledBy,
      committedQuantity,
      backOrderQuantity,
      onOrderQuantity,
      afnFulfillableQuantity,
      reservedQuantity,
      salePrice,
      subTotal,
      relationProductStockNumber,
      relationalProductQuantityInStock,
      status,
      isPacked,
      action
    };
  }

  const handleOpenWindow = (id) => {
    navigate(`/products/${id}`);
  };

  const handleEditOrderItem = (e) => {
    const { name, value } = e.target;

    const errors = editItemHelperText;
    if (name === 'quantity') {
      if (!value || +value === 0) {
        errors.quantity = ' ';
      } else {
        errors.quantity = '';
      }
    } else if (name === 'price' && (!value || +value === 0)) {
      errors.price = ' ';
    } else {
      errors.price = '';
    }

    setEditItemHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
    setUpdateOrderItem({
      ...updateOrderItem,
      [name]: value
    });
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
    setOrderItemsList([]);
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const getOrderItems = () => {
    const skip = (pageNumber - 1) * pageLimit;

    const limit = pageLimit;
    setLocalLoading(true);
    dispatch(GetOrderItems({
      skip,
      limit,
      orderId: newOrderId
    }));
  };

  const handleCheckBoxClick = (e, prodId) => {
    if (e.target.checked) {
      setSelectedOrdersItems([
        ...selectedOrdersItems,
        prodId
      ]);
    } else {
      const ordersIdList = selectedOrdersItems.filter((id) => id !== prodId);
      setSelectedOrdersItems([...ordersIdList]);
    }
  };

  const handleHeaderCheckBoxClicked = (e) => {
    const allOrderItemsId = orderItems.map((order) => (order.orderItemId));

    if (e.target.checked) {
      setHeaderCheckBox(true);
      setSelectedOrdersItems([...selectedOrdersItems, ...allOrderItemsId]);
    } else {
      const filteredId = selectedOrdersItems.filter(
        (id) => !allOrderItemsId.includes(id)
      );

      setHeaderCheckBox(false);
      setSelectedOrdersItems(filteredId);
    }
  };

  const handleDeleteOrderItem = () => {
    if (!isEmpty(deleteOrderItemId) && mode === 'singleDelete') {
      dispatch(DeleteOrderItemsById({
        orderItemsIdList: [deleteOrderItemId]
      }));
    } else if (mode === 'bulkDelete' && selectedOrdersItems.length) {
      dispatch(DeleteOrderItemsById({
        orderItemsIdList: selectedOrdersItems
      }));
    }
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

  const handlePackImageError = (event, image) => {
    event.target.src = image;
  };

  const handleClose = () => {
    setTimeout(() => {
      if (!modalOpen) {
        setAnchorEl(null);
      }
    }, 0);
  };

  const handlePackDetailsPageLimit = (e) => {
    setPackItemPagination({
      pageNumber: 1,
      pageLimit: e
    });
  };

  const handlePackDetailsPageNumber = (e) => {
    setPackItemPagination({
      ...packItemPagination,
      pageNumber: e
    });
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

  const handleSortChange = (e, header) => {
    if (editInput) return;
    const sortKey = camelCase(header);
    const currentSortValue = sortValue[sortKey];

    let newSortValue;

    if (!currentSortValue) {
      newSortValue = 'asc';
    } else if (currentSortValue === 'asc') {
      newSortValue = 'desc';
    } else {
      newSortValue = '';

      setNewViewOrderItemsLocalCopy(orderItems);

      setSortValue((prevSortValue) => ({
        ...prevSortValue,
        [sortKey]: newSortValue
      }));
      return;
    }

    setSortValue((prevSortValue) => ({
      ...prevSortValue,
      [sortKey]: newSortValue
    }));

    let sortByValue = '';
    if (sortKey === 'quantityOrdered') sortByValue = 'orderItemQuantity';
    else if (sortKey === 'unitPrice') sortByValue = 'salePrice';
    else if (sortKey === 'quantityInStock') sortByValue = 'quantityInStock';
    else if (sortKey === 'backOrder') sortByValue = 'backOrderQuantity';
    else if (sortKey === 'reserved') sortByValue = 'reservedQuantity';
    else if (sortKey === 'onOrder') sortByValue = 'onOrderQuantity';
    else if (sortKey === 'rpStock') sortByValue = 'relationalProductQuantityInStock';
    else if (sortKey === 'pack') sortByValue = 'isPacked';
    else if (sortKey === 'fbaUs') sortByValue = 'afnFulfillableQuantity';

    const sortedData = orderItems.slice().sort((a, b) => {
      if (sortByValue === 'isPacked') {
        // Sort boolean values

        if (a[sortByValue] === b[sortByValue]) {
          return 0;
        }
        return a[sortByValue] ? (newSortValue === 'asc' ? -1 : 1) : (newSortValue === 'asc' ? 1 : -1);
      } if (newSortValue === 'asc') {
        // Compare in ascending order
        return a[sortByValue] - b[sortByValue];
      } if (newSortValue === 'desc') {
        // Compare in descending order
        return b[sortByValue] - a[sortByValue];
      }
      // No sorting
      return 0;
    });

    setNewViewOrderItemsLocalCopy([...sortedData]);
  };

  useEffect(() => {
    if (!deleteOrderItemLoading) {
      setDeleteItem(false);
      setMode('');
    }
  }, [deleteOrderItemLoading]);

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
                  onError={(e) => handlePackImageError(e, Product)}
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
                      {row.itemId?.title}
                    </span>
                  </Tooltip>
                ) : (
                  <span>
                    {row.itemId?.title?.length
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
    setEditItemHelperText({
      quantity: '',
      price: ''
    });
  }, [editItemId]);

  useEffect(() => {
    if (difference(orderItemsIds, selectedOrdersItems).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedOrdersItems]);

  useEffect(() => {
    if (!isEmpty(packDetailProductId)) {
      getPackItems();
    }
  }, [packDetailProductId, packItemPagination]);

  useEffect(() => {
    if (newViewOrderItemsLocalCopy?.length) {
      const orderItemsData = newViewOrderItemsLocalCopy.map((row) => {
        const updatePriceAsNumber = parseFloat(parseFloat(updateOrderItem.price || 0)).toFixed(2);
        const updatedQuantityAsNumber = parseFloat(updateOrderItem.quantity || 0);

        const updatedSubTotal = (
          +(Number(updatePriceAsNumber).toFixed(2)) * Number(updatedQuantityAsNumber)
        ).toFixed(2);

        const priceAsNumber = parseFloat(parseFloat(row.salePrice)).toFixed(2);
        const quantityAsNumber = parseFloat(row.orderItemQuantity);

        const totalSalePrice = !Number.isNaN(priceAsNumber) && !Number.isNaN(quantityAsNumber)
          ? (parseFloat(priceAsNumber) * parseFloat(quantityAsNumber)).toFixed(2)
          : null;

        return (
          OrderedCreateData(
            row.orderItemId,
            row.productId,
            row.primaryImageUrl,
            row.title,
            row.primaryUpc,
            row.stockNumber,
            <Box component="span" color="#272B41">{row.mfgPartNo || '--'}</Box>,
            <Box component="span" color="#E61F00">{row.quantityInStock || '--'}</Box>,
            <Input
              autoComplete="off"
              isError
              disabled={!editInput || row.orderItemId !== editItemId}
              key={row.orderItemId}
              value={!editInput || row.orderItemId !== editItemId
                ? (row.orderItemQuantity || 0)
                : updateOrderItem.quantity}
              marginBottom="0"
              width="69px"
              name="quantity"
              onChange={(e) => {
                if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                  handleEditOrderItem(e);
                } else {
                  e.target.value = '';
                }
              }}
              helperText={
                editInput && row?.orderItemId === editItemId
                  && editItemHelperText.quantity.length > 0
              }
            />,
            row?.fulfilledBy || '--',
            (row?.fulfilledQuantityDetails?.fulfilledByMatchedSku
              || row?.fulfilledQuantityDetails?.fulfilledByRelationalSku)
              ? (
                <Box>
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={(
                      <Box display="flex" flexDirection="column">
                        <Box display="flex" mb={1}>
                          <Box component="strong">
                            Fulfilled By Matched SKU =
                          </Box>
                          <Box component="span" ml={1}>{row?.fulfilledQuantityDetails?.fulfilledByMatchedSku}</Box>
                        </Box>
                        <Box display="flex">
                          <Box component="strong">
                            Fulfilled By Relational SKU =
                          </Box>
                          <Box component="span" ml={1}>{row?.fulfilledQuantityDetails?.fulfilledByRelationalSku}</Box>
                        </Box>
                      </Box>
  )}
                  >
                    <span>
                      {
                        row?.fulfilledQuantityDetails?.fulfilledByMatchedSku
                        + row?.fulfilledQuantityDetails?.fulfilledByRelationalSku
                    }
                    </span>
                  </Tooltip>
                </Box>
              )
              : '--',
            row.backOrderQuantity || '--',
            row.onOrderQuantity || '--',
            row.afnFulfillableQuantity || '--',
            row.reservedQuantity || '--',
            <Input
              autoComplete="off"
              isError
              name="price"
              disabled={!editInput || row.orderItemId !== editItemId}
              value={!editInput || row.orderItemId !== editItemId
                ? Number(row.salePrice || 0).toFixed(2) : updateOrderItem.price}
              width="69px"
              marginBottom="0"
              onChange={(e) => {
                if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                  handleEditOrderItem(e);
                } else {
                  e.target.value = '';
                }
              }}
              helperText={
                editInput && row?.orderItemId === editItemId
                  && editItemHelperText.price.length > 0
              }
            />,
            (!editInput || row.orderItemId !== editItemId) ? totalSalePrice || '$0.00'
              : updatedSubTotal || '$0.00',
            <Box display="flex" flexDirection="column" color="#272B41" gap="2px">
              <Box component="span">{row.relationProductStockNumber || 'Not Selected'}</Box>
            </Box>,
            <Box display="flex" flexDirection="column" color="#272B41" gap="2px">
              <Box component="span">{row.relationalProductQuantityInStock || '--'}</Box>
            </Box>,
            <Box className={BADGE_CLASS[camelCase(row.status)]}>
              {row.status ? startCase(lowerCase(row.status)) : '--'}
            </Box>,
            row.isPacked,
            <Stack
              key={row.orderItemId}
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Box
                className={`icon-${editInput && row.orderItemId === editItemId ? 'Save color-primary' : 'edit'} pointer`}
                onClick={() => {
                  if (editItemId && row.orderItemId !== editItemId) {
                    setEditInput(true);
                    setEditItemId(row.orderItemId);
                    setUpdateOrderItem({
                      quantity: row.orderItemQuantity,
                      price: row.salePrice
                    });
                  } else if (editInput === true) {
                    // save the changes
                    if (Number(updateOrderItem.quantity) < 1) {
                      dispatch(SetOrderNotifyState({ message: 'Min Quantity Should be 1', type: 'error' }));
                    } else if (Number(updateOrderItem.price) <= 0) {
                      dispatch(SetOrderNotifyState({ message: 'Min Price Should be greater than 0', type: 'error' }));
                    } else if ((Number(updateOrderItem.quantity) !== Number(row.orderItemQuantity)
                        || Number(updateOrderItem.price) !== Number(row.salePrice))
                    ) {
                      dispatch(UpdateOrderItem({
                        orderItemId: row.orderItemId,
                        quantity: Number(updateOrderItem.quantity),
                        price: Number(updateOrderItem.price)
                      }));

                      setEditItemHelperText({
                        quantity: '',
                        price: ''
                      });
                      setEditInput(!editInput);

                      setSortValue({
                        quantityInStock: '',
                        quantityOrdered: '',
                        unitPrice: '',
                        backOrder: '',
                        reserved: '',
                        onOrder: '',
                        rpStock: '',
                        fbaUs: '',
                        isPacked: ''
                      });
                    } else {
                      dispatch(SetOrderNotifyState({ message: 'Nothing Updated', type: 'info' }));
                      setEditItemHelperText({
                        quantity: '',
                        price: ''
                      });
                      setEditInput(!editInput);
                    }
                  } else {
                    // edit mode
                    setUpdateOrderItem({
                      quantity: row.orderItemQuantity,
                      price: row.salePrice
                    });
                    setEditItemId(row.orderItemId);
                    setEditInput(!editInput);
                  }
                }}
              />
              <Box
                component="span"
                className={editInput && row.orderItemId === editItemId ? 'icon-trash disabled' : 'icon-trash pointer'}
                onClick={() => {
                  if (!editInput || row.orderItemId !== editItemId) {
                    setMode('singleDelete');
                    setDeleteOrderItemId(row.orderItemId);
                  }
                }}
              />
              {
                row.primaryUpc?.length === 11 || row.primaryUpc?.length === 12
                  ? (
                    <Box
                      component="span"
                      className="icon-print pointer"
                      onClick={() => {
                        setUpc(row.primaryUpc);
                        setPrint(true);
                      }}
                    />
                  ) : (
                    <Box
                      component="span"
                      className="icon-print disabled"
                    />
                  )
              }

              <Box
                component="span"
                className="icon-left-arrow pointer"
                onClick={() => handleOpenWindow(row.productId)}
              />
            </Stack>
          )
        );
      });
      setOrderItemsList(orderItemsData);
    } else {
      setOrderItemsList([]);
    }
  }, [newViewOrderItemsLocalCopy, editInput, editItemId, updateOrderItem, editItemHelperText]);

  useEffect(() => {
    if (orderItems.length) {
      setNewViewOrderItemsLocalCopy([...orderItems]);
    } else {
      setNewViewOrderItemsLocalCopy([]);
    }
  }, [orderItems]);

  useEffect(() => {
    setLocalLoading(false);
  }, [orderItems]);

  useEffect(() => {
    if (orderItems?.length) {
      const orderItemsIdList = orderItems.map((rowData) => (rowData.orderItemId));
      setOrderItemsIds(orderItemsIdList);

      if (difference(orderItemsIdList, selectedOrdersItems).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setHeaderCheckBox(false);
    }
  }, [orderItems]);

  useEffect(() => {
    if (upc && print) {
      buttonRef.current.click();
    }
  }, [print]);

  useEffect(() => {
    if (mode === 'singleDelete' || mode === 'bulkDelete') {
      setDeleteItem(true);
    }
  }, [mode]);

  useEffect(() => {
    if (itemsDeleted) {
      dispatch(SetOrderState({ field: 'itemsDeleted', value: false }));
      if (pageNumber !== 1) setPageNumber(1);
      else getOrderItems();

      setSelectedOrdersItems([]);
    }
    setMode('');
  }, [itemsDeleted]);

  useEffect(() => {
    if (!isEmpty(newOrderId)) {
      getOrderItems();
    }
  }, [pageNumber, pageLimit]);

  useEffect(() => {
    if (!addItems && itemsAdded && !isEmpty(newOrderId)) {
      getOrderItems();
      dispatch(SetOrderState({ field: 'itemsAdded', value: false }));
    }
  }, [addItems, itemsAdded]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="mb-0">Item Ordered</h3>
        <Box display="flex" gap={2}>
          <Button
            text="Add Order Item"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => setAddItems(true)}
            disabled={!newOrderId || editInput}
          />
          <Button
            text="Remove Selected items"
            disabled={!newOrderId || !selectedOrdersItems.length || editInput}
            startIcon={<span className="icon-trash" />}
            onClick={() => setMode('bulkDelete')}
            color="error"
          />
        </Box>
      </Box>
      <Box mt={3} position="relative">
        {(getOrderItemsLoading || localLoading || updateOrderItemLoading)
          ? <LoaderWrapper />
          : null}
        <Table
          checkbox
          className="supplier-details-table"
          fixed
          tableHeader={newOrderedItemHeader}
          height="635px"
          bodyPadding="8px 12px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          key="orderItemsHeader"
          disabled={isEmpty(newOrderId)}
          sortableHeader={sortTableByOrderItemsHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          { orderItemsList.length ? (
            orderItemsList.map((row) => (
              <TableRow
                hover
                key={row.orderItemId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box
                    component="span"
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                  >
                    <Checkbox
                      key={row.orderItemId}
                      marginBottom="0"
                      className="body-checkbox"
                      checked={selectedOrdersItems?.includes(String(row.orderItemId))}
                      onClick={(e) => handleCheckBoxClick(e, row.orderItemId)}
                    />
                    <Stack direction="row" spacing={1}>
                      {row?.primaryImageUrl ? (
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
                              bucketName: 'productImage', key: row.primaryImageUrl
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
                          className="product-name-clamp"
                          component="span"
                        >
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
                <TableCell>{row.mfg}</TableCell>
                <TableCell>{row.quantityInStock}</TableCell>
                <TableCell>{row.orderItemQuantity}</TableCell>
                {/* <TableCell>{row.fulfilledBy}</TableCell>
                <TableCell>{row.committedQuantity}</TableCell> */}
                <TableCell>{row.backOrderQuantity}</TableCell>
                <TableCell>{row.onOrderQuantity}</TableCell>
                <TableCell>{row.afnFulfillableQuantity}</TableCell>
                <TableCell>{row.reservedQuantity}</TableCell>
                <TableCell>{row.salePrice}</TableCell>
                <TableCell>{row.subTotal}</TableCell>
                <TableCell>{row.relationProductStockNumber}</TableCell>
                <TableCell>{row.relationalProductQuantityInStock}</TableCell>
                <TableCell>{row.status}</TableCell>
                {/* <TableCell>{row.isPacked}</TableCell> */}
                <TableCell>
                  { row?.isPacked ? (
                    <CheckCircleIcon
                      aria-describedby={id}
                      onMouseEnter={(e) => handleViewPackItemsClick(e, row.productId)}
                      onMouseLeave={handleClose}
                      sx={{
                        color: '#0FB600',
                        width: 16
                      }}
                    />
                  ) : (
                    <CheckCircleOutlinedIcon
                      sx={{ color: '#979797', fontSize: 16 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">{row.action}</TableCell>
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
        <Popover
          className="approve-popover"
          id={id}
          open={open}
          anchorEl={anchorEl}
          onMouseEnter={() => {
            modalOpen = true;
          }}
          onMouseLeave={() => {
            modalOpen = false;
            handleClose();
          }}
          onClose={() => handleClose()}
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

        {/* <Pagination
          position="relative"
          width="0"
          perPageRecord={orderItems?.length || 0}
          componentName="others"
          total={totalOrderItems}
          totalPages={Math.ceil(totalOrderItems / pageLimit)}
          offset={totalOrderItems}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        /> */}
        <ItemDelete
          loading={deleteOrderItemLoading}
          onDelete={handleDeleteOrderItem}
          show={deleteItem}
          lastTitle="Delete This File!"
          onClose={() => { setDeleteItem(false); setMode(''); }}
        />
        <AddItemsList open={addItems} onClose={() => setAddItems(false)} />
      </Box>
      <ReactToPrint
        trigger={() => (
          <button ref={buttonRef} style={{ display: 'none' }} />
        )}
        content={() => tableRef.current}
        onAfterPrint={() => {
          setPrint(false);
        }}
      />
      {print
        ? (
          <BarcodeFile
            ref={tableRef}
            value={upc}
          />
        )
        : null}
    </>
  );
};
export default ItemOrdered;
