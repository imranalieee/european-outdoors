import React, { useState, useEffect } from 'react';
import BarcodeReader from 'react-barcode-reader';
import {
  Stack,
  Box,
  TableCell,
  TableRow,
  Divider,
  Grid,
  Tooltip
} from '@mui/material';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import {
  isEmpty, lowerCase, startCase, camelCase
} from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
// component
import Button from '../../../../components/button';
import Table from '../../../../components/ag-grid-table';
import SearchInput from '../../../../components/searchInput';
import Alert from '../../../../components/alert';
import Input from '../../../../components/inputs/input';
import OrderNo from './drawer/orderNo';
import CreateBox from './drawer/createBox';
import HoverImage from '../../../../components/imageTooltip';
import LoaderWrapper from '../../../../components/loader';
// images
import noData from '../../../../static/images/no-data-table.svg';
import Product from '../../../../static/images/no-product-image.svg';

import WorflowActionPrimary from '../../../../static/images/workflow-icon-1.svg';
import WorflowActionSecondary from '../../../../static/images/workflow-icon-2.svg';
import ItemDelete from './modals/delete';
import EditShipByModal from './modals/editShip';
import BoxLogs from './drawer/boxLogs';
// helpers
import {
  GetS3ImageUrl, generateSalesChannelLink
} from '../../../../../utils/helpers';
// Redux
import {
  AddBox,
  AddBoxItem,
  GetOrderDetail,
  GetItemsOfProcessOrder,
  GetBoxesByOrderId,
  GetBoxItemsByBoxIds,
  GetProductBoxDimensionById,
  DeleteBoxById,
  SetProcessOrderState,
  SetProcessOrderNotifyState,
  SetOrderState,
  UpdateOrderById
} from '../../../../redux/slices/order';
import {
  SetOrderPickSheetState
} from '../../../../redux/slices/order/pick-sheet-slice';

import {
  SetUpsState, SetUspsState, SetAmazonState
} from '../../../../redux/slices/shipment/index';

import {
  orderedWorkflowHeader,
  PLATFORMS,
  REGEX_FOR_NUMBERS,
  VENDOR_CENTRAL,
  BADGE_CLASS,
  sortOrderedWorkflowHeader
} from '../../../../constants/index';

const OrderWorkFlow = (props) => {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const {
    updatedBox,
    boxDeleted,
    boxItems,
    addedBoxItem,
    itemsOfProcessOrder,
    totalItemsOfProcessOrder,
    orderBoxes,
    itemsOfProcessOrderPageNumber,
    itemsOfProcessOrderPageLimit,
    itemsOfProcessOrderLoading,
    boxesLoading,
    newBox,
    productBoxDimension,
    productDimensionsFetched,
    deleteBoxLoading,
    openModal
  } = useSelector((state) => state.processOrder);

  const {
    getOrderDetailLoading,
    order,
    orderCustomerDetail,
    updateOrderLoading,
    orderUpdated
  } = useSelector((state) => state.order);

  const {
    vcShipmentPurchased
  } = useSelector((state) => state.vendorCentral);

  const {
    user: { permissions: { editOrders = false } = {} }
  } = useSelector((state) => state.auth);

  const [orderNo, setOrderNo] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [createBox, setCreateBox] = useState(false);
  const [deleteItems, setDeleteItems] = useState(false);
  const [editInput, setEditInput] = useState(false);
  const [localOrderBoxes, setLocalOrderBoxes] = useState([]);
  const [localItemsOfProcessOrder, setLocalItemsOfProcessOrder] = useState([]);
  const [selectedBox, setSelectedBox] = useState({});
  const [upc, setUpc] = useState('');
  const [editItemHelperText, setEditItemHelperText] = useState({
    boxedQuantity: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editItem, setEditItem] = useState('');
  const [editBox, setEditBox] = useState({});
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [shipDate, setShipDate] = useState(false);
  const [updateShipByDateError, setUpdateShipByDateError] = useState('');
  const [updatedShipByDate, setUpdatedShipByDate] = useState(null);
  const [openBox, setOpenBox] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState(true);
  const [openLogs, setOpenLogs] = useState(false);
  const [sortValue, setSortValue] = useState({});

  function OrderedcreateData(
    itemDetails,
    quantity,
    boxedQty,
    toBoxQty,
    action
  ) {
    return {
      itemDetails,
      quantity,
      boxedQty,
      toBoxQty,
      action
    };
  }
  const orderedData = [];
  for (let i = 0; i <= 10; i += 1) {
    orderedData.push(
      OrderedcreateData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img width={40} height={40} src={Product} alt="" />
          </HoverImage>
          <Box>
            <Box
              component="span"
              className="product-name-clamp"
              whiteSpace="normal"
            >
              Rapido Boutique Collection Flipper Open Heel Adjustable Fin -
              LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  194773048809
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  RQFA68-PR-S/M
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        <Input width="30px" className="table-input-small" value="3" marginBottom="0px" />,
        <Input width="30px" className="table-input-small" value="3" marginBottom="0px" />,
        <Input width="30px" className="table-input-small" value="3" marginBottom="0px" />,
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Box display="flex" gap={2}>
            <Box className={`icon-${editInput ? 'Save color-primary' : 'edit'} pointer`} onClick={() => setEditInput(!editInput)} />
          </Box>
        </Stack>
      )
    );
  }

  const getProductBoxDimensionById = (id) => {
    dispatch(GetProductBoxDimensionById({ productId: id }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const getOrderDetail = () => {
    if (!isEmpty(orderId)) {
      dispatch(GetOrderDetail({ orderId }));
    }
  };

  const getItemsOfProcessOrder = () => {
    const skip = (itemsOfProcessOrderPageNumber - 1)
      * itemsOfProcessOrderPageLimit;
    const limit = itemsOfProcessOrderPageLimit;
    if (!isEmpty(orderId)) {
      dispatch(GetItemsOfProcessOrder({
        skip, limit, orderId
      }));
    }
  };

  const getBoxesByOrderId = () => {
    if (!isEmpty(orderId)) {
      dispatch(GetBoxesByOrderId({ orderId }));
    }
  };

  const getBoxItemsByBoxIds = () => {
    if (orderBoxes?.length) {
      const boxIds = orderBoxes?.map((item) => item?._id);
      dispatch(GetBoxItemsByBoxIds({ boxIds }));
    }
  };

  const deleteBoxById = () => {
    if (!isEmpty(orderId) && !isEmpty(selectedBox?._id)) {
      setAddItemLoading(true);
      dispatch(DeleteBoxById({
        orderId,
        boxId: selectedBox?._id
      }));
    }
  };

  const handleAddBoxItem = (scannedUpc = upc) => {
    if (!isEmpty(scannedUpc) && !isEmpty(orderId) && orderBoxes?.length) {
      const findProduct = itemsOfProcessOrder?.find((item) => item?.primaryUpc === scannedUpc);

      if (!isEmpty(findProduct)) {
        if (Number(findProduct?.orderItemQuantity !== findProduct?.boxedQuantity)) {
          const findNonShippedBox = orderBoxes?.find((obj) => !obj?.trackingNo || obj?.trackingNo === '');
          if (!isEmpty(findNonShippedBox)) {
            setAddItemLoading(true);
            dispatch(
              AddBoxItem({
                addBoxItem: {
                  orderId,
                  boxId: findNonShippedBox?._id,
                  parentId: findProduct?.parentId,
                  productId: findProduct?.productId,
                  productQuantity: 1,
                  unitPrice: findProduct?.unitPrice,
                  itemIdentifier: findProduct?.itemIdentifier,
                  marketplaceSku: findProduct?.marketplaceSku
                }
              })
            );
            if (!isEmpty(findNonShippedBox)) {
              dispatch(SetProcessOrderState({
                field: 'openModal',
                value: { product: findProduct, box: findNonShippedBox }
              }));
            }
          } else {
            setAddItemLoading(true);
            const findProd = itemsOfProcessOrder?.find((item) => item?.primaryUpc === scannedUpc);
            getProductBoxDimensionById({ id: findProd?.productId });
          }
        } else {
          setCreateBox(false);
          dispatch(
            SetProcessOrderNotifyState({
              message: 'No boxed quantity left!',
              type: 'info'
            })
          );
        }
      } else {
        dispatch(
          SetProcessOrderNotifyState({
            message: 'Product not found in this Order!',
            type: 'info'
          })
        );
      }
    } else if (!orderBoxes?.length && !isEmpty(scannedUpc)) {
      const findProductUpc = itemsOfProcessOrder?.find((item) => item?.primaryUpc === scannedUpc);
      if (!isEmpty(findProductUpc)) {
        setAddItemLoading(true);
        const findProduct = itemsOfProcessOrder?.find((item) => item?.primaryUpc === scannedUpc);
        getProductBoxDimensionById({ id: findProduct?.productId });
      } else {
        dispatch(
          SetProcessOrderNotifyState({
            message: 'Product not found in this Order!',
            type: 'info'
          })
        );
      }
    }
  };

  const handleEditItem = () => {
    if (!isEmpty(editItem)) {
      const errors = {};
      Object.keys(editItem)?.forEach((key) => {
        if ((key === 'boxedQuantity') && editItem?.boxedQuantity === '') {
          errors[key] = ' ';
          errors._id = editItem?.orderItemId;
        } else {
          errors[key] = '';
        }
      });
      setEditItemHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));

      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        if (editItem?.boxedQuantity && orderBoxes?.length) {
          const findItem = localItemsOfProcessOrder?.find(
            (item) => item?.orderItemId === editItem?.orderItemId
              && item?.productId === editItem?.productId
          );
          if (Number(findItem?.boxedQuantity)
            !== Number(editItem?.boxedQuantity)) {
            const filteredBoxes = orderBoxes?.filter((box) => box.trackingNo && box.trackingNo !== '');
            const filteredBoxIds = filteredBoxes?.map((box) => box._id);

            const filteredBoxItems = boxItems
              ?.filter((item) => filteredBoxIds.includes(item?.boxId));

            const totalBoxedQuantity = filteredBoxItems?.reduce((sum, item) => {
              if (item?.productId?._id === editItem?.productId) {
                sum += item?.productQuantity;
              }
              return sum;
            }, 0);

            if (totalBoxedQuantity > Number(editItem?.boxedQuantity)) {
              dispatch(
                SetProcessOrderNotifyState({
                  message: `Boxed Qty cannot be less than ${totalBoxedQuantity} !`,
                  type: 'info'
                })
              );
            } else {
              const findNonShippedBox = orderBoxes?.find((obj) => !obj?.trackingNo || obj?.trackingNo === '');
              if (!isEmpty(findNonShippedBox)) {
                setAddItemLoading(true);
                dispatch(
                  AddBoxItem({
                    addBoxItem: {
                      orderId,
                      boxId: findNonShippedBox?._id,
                      productId: findItem?.productId,
                      productQuantity: Number(editItem?.boxedQuantity || 0)
                        - Number(findItem?.boxedQuantity || 0),
                      unitPrice: findItem?.unitPrice,
                      parentId: findItem?.parentId,
                      itemIdentifier: findItem?.itemIdentifier,
                      marketplaceSku: findItem?.marketplaceSku
                    }
                  })
                );
              } else {
                setUpc(editItem?.primaryUpc);
                setOrderId(params.id);
                getProductBoxDimensionById({ id: editItem?.productId });
              }
            }
          }
        } else if (!orderBoxes?.length) {
          dispatch(
            SetProcessOrderNotifyState({
              message: 'Please create a box!',
              type: 'info'
            })
          );
        }
      }
    }
  };

  const handleOnchange = () => {
    const errors = {};
    Object.keys(editItem).forEach((key) => {
      if (key === 'boxedQuantity') {
        if (editItem?.boxedQuantity === '') {
          errors.boxedQuantity = ' ';
          errors._id = editItem?.orderItemId;
        } if (editItem?.boxedQuantity) {
          errors.boxedQuantity = '';
          errors._id = '';
        }
      }
    });
    setEditItemHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const resetValues = () => {
    dispatch(
      SetUpsState({
        field: 'upsGroundRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsStandardOvernightRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsNextDayAirSaverRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsSurePostRates',
        value: 0
      })
    );
    dispatch(
      SetUspsState({
        field: 'uspsGroundRates',
        value: 0
      })
    );
    dispatch(
      SetAmazonState({
        field: 'amazonRates',
        value: 0
      })
    );
  };

  const handleClickMarketPlace = ({ e, id, salesChannel }) => {
    const link = generateSalesChannelLink({
      id,
      salesChannel
    });

    e.target.href = link;
  };

  const handleShipDateChange = (e) => {
    setUpdatedShipByDate(e.target.value);

    if (order.purchaseDate && moment(e.target.value).isBefore(order.purchaseDate)) {
      setUpdateShipByDateError('Ship Date should be after the order Received Date');
    } else {
      setUpdateShipByDateError('');
    }
  };

  const handleSaveShipDate = () => {
    if (isEmpty(updateShipByDateError)) {
      if (updatedShipByDate && moment(updatedShipByDate).isValid()) {
        dispatch(UpdateOrderById({ shipBy: updatedShipByDate, orderId }));
      } else {
        setUpdateShipByDateError('Select the valid date');
      }
    } else {
      setUpdateShipByDateError('ShipBy date should be after the order received on date');
    }
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
      setLocalItemsOfProcessOrder(itemsOfProcessOrder);

      setSortValue((prevSortValue) => ({
        [sortKey]: newSortValue
      }));
      return;
    }

    setSortValue((prevSortValue) => ({
      [sortKey]: newSortValue
    }));

    let sortByValue = '';
    if (sortKey === 'orderQty') sortByValue = 'orderItemQuantity';
    else if (sortKey === 'boxedQty' || sortKey === 'toBoxQty') sortByValue = 'boxedQuantity';

    const sortedData = localItemsOfProcessOrder?.slice().sort((a, b) => {
      if (newSortValue === 'asc' || newSortValue === 'desc') {
        const compareValue = (a[sortByValue] || 0) - (b[sortByValue] || 0);
        return newSortValue === 'asc' ? compareValue : -compareValue;
      }
      return 0;
    });
    setLocalItemsOfProcessOrder([...sortedData]);
  };

  useEffect(() => {
    if (!isEmpty(orderId)) {
      getOrderDetail();
      getItemsOfProcessOrder();
      getBoxesByOrderId();
    }
  }, [orderId]);

  useEffect(() => {
    setAddItemLoading(false);
    if (itemsOfProcessOrder?.length) {
      const addIsEdit = itemsOfProcessOrder?.map((item) => ({ ...item, isEdit: false }));
      setLocalItemsOfProcessOrder(addIsEdit);

      if (!isEmpty(openModal)) {
        const findProduct = itemsOfProcessOrder?.find((item) => item?.primaryUpc
          === openModal?.product?.primaryUpc);
        if (Number((findProduct?.orderItemQuantity) === Number(findProduct?.boxedQuantity))) {
          setEditBox(openModal?.box);
          setScannedBarcode(false);
          resetValues();
          setCreateBox(true);
        }
      }
    } else {
      setLocalItemsOfProcessOrder([]);
    }
  }, [itemsOfProcessOrder]);

  useEffect(() => {
    if (orderBoxes?.length) {
      getBoxItemsByBoxIds();
      setLocalOrderBoxes(orderBoxes);
    } else {
      setLocalOrderBoxes([]);
    }
  }, [orderBoxes]);

  useEffect(() => {
    if (order?.salesChannel !== VENDOR_CENTRAL) {
      setCreateBox(false);
      setEditBox({});
    }

    if (updatedBox) {
      getBoxesByOrderId();
      dispatch(SetProcessOrderState({
        field: 'updatedBox',
        value: false
      }));
    }
    if (boxDeleted || vcShipmentPurchased) {
      setDeleteItems(false);
      getBoxesByOrderId();
      getItemsOfProcessOrder();
      dispatch(SetProcessOrderState({
        field: 'boxDeleted',
        value: false
      }));
      dispatch(SetProcessOrderState({
        field: 'vcShipmentPurchased',
        value: false
      }));
    }
  }, [boxDeleted, updatedBox, vcShipmentPurchased]);

  useEffect(() => {
    getBoxesByOrderId();
    setUpc('');
    if (addedBoxItem) {
      getItemsOfProcessOrder();
    }
  }, [addedBoxItem]);

  useEffect(() => {
    const { id } = params;
    setOrderId(id);
  }, []);

  useEffect(() => () => {
    dispatch(SetOrderState({ field: 'order', value: {} }));
    dispatch(SetOrderState({ field: 'orderCustomerDetail', value: {} }));
    if (!window.location.pathname.startsWith('/orders' || '/orders/')) {
      dispatch(SetOrderState({
        field: 'orderManagerFilters',
        value: {
          salesChannel: '',
          orderStatus: '',
          orderManagerPageLimit: 100,
          orderManagerPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
      dispatch(SetOrderPickSheetState({
        field: 'pickSheetFilters',
        value: {
          salesChannel: '',
          pickSheetPageLimit: 100,
          pickSheetPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
      dispatch(SetProcessOrderState({
        field: 'processOrderFilters',
        value: {
          salesChannel: '',
          processOrderPageLimit: 100,
          processOrderPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
    }
    dispatch(SetProcessOrderState({
      field: 'itemsOfProcessOrder',
      value: []
    }));
    dispatch(SetProcessOrderState({
      field: 'orderBoxes',
      value: []
    }));
  }, []);

  useEffect(() => {
    if (!isEmpty(newBox)) {
      if (!isEmpty(upc) && !isEmpty(orderId)) {
        const findProduct = itemsOfProcessOrder?.find((item) => item?.primaryUpc === upc);

        if (findProduct) {
          if (Number(findProduct?.orderItemQuantity !== findProduct?.boxedQuantity)) {
            dispatch(
              AddBoxItem({
                addBoxItem: {
                  orderId,
                  boxId: newBox?._id,
                  parentId: findProduct?.parentId,
                  productId: findProduct?.productId,
                  productQuantity: 1,
                  unitPrice: findProduct?.unitPrice,
                  itemIdentifier: findProduct?.itemIdentifier,
                  marketplaceSku: findProduct?.marketplaceSku
                }
              })
            );

            if (!isEmpty(newBox)) {
              dispatch(SetProcessOrderState({
                field: 'openModal',
                value: { product: findProduct, box: newBox }
              }));
            }
          } else {
            dispatch(
              SetProcessOrderNotifyState({
                message: 'No boxed quantity left!',
                type: 'info'
              })
            );
          }
        } else {
          dispatch(
            SetProcessOrderNotifyState({
              message: 'Product not found in this Order!',
              type: 'info'
            })
          );
        }
      }
      dispatch(SetProcessOrderState({
        field: 'newBox',
        value: null
      }));
    }
  }, [newBox]);

  useEffect(() => {
    if (orderUpdated) {
      setShipDate(false);
      dispatch(SetOrderState({ field: 'orderUpdated', value: false }));
    }
  }, [orderUpdated]);

  useEffect(() => {
    if (productDimensionsFetched) {
      if (!isEmpty(productBoxDimension)) {
        if (itemsOfProcessOrder?.length === 1) {
          const { boxDimensions } = productBoxDimension;
          dispatch(AddBox({
            addBox: {
              orderId,
              width: Number(boxDimensions?.width || 0),
              height: Number(boxDimensions?.height || 0),
              length: Number(boxDimensions?.length || 0),
              weight: Number(boxDimensions?.weight || 0)
            }
          }));
        } else {
          dispatch(AddBox({
            addBox: {
              orderId,
              width: 0,
              height: 0,
              length: 0,
              weight: 0
            }
          }));
        }
      } else {
        dispatch(AddBox({
          addBox: {
            orderId,
            width: 0,
            height: 0,
            length: 0,
            weight: 0
          }
        }));
      }
      dispatch(SetProcessOrderState({
        field: 'productDimensionsFetched',
        value: false
      }));
    }
  }, [productDimensionsFetched]);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        pt={3}
        pb={3}
        marginTop="-24px"
        sx={{
          position: 'sticky',
          top: '78.5px',
          zIndex: '999',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgb(151, 151, 151, 0.25)'
        }}
      >
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={() => navigate('/orders/process-orders')}
          />
          <h2 className="m-0 pl-2">
            Order No:
            {order?.orderNumber || '--'}
          </h2>
        </Stack>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <Box marginRight={2}>
            <Button
              disabled={!editOrders}
              text="View Order"
              startIcon={<span className="icon-products" />}
              onClick={() => {
                navigate(`/orders/${orderId}`);
              }}
            />
          </Box>
          <Box className={BADGE_CLASS[camelCase(order.orderStatus)]} fontSize="13px" fontWeight="600">
            {order?.orderStatus ? startCase(lowerCase(order?.orderStatus)) : '--'}
          </Box>
          <Box ml={2}>
            <Box component="span" color="#979797" fontSize="11px">
              Status Updated:
            </Box>
            <Box component="span" color="#272B41" fontSize="13px">
              {' '}
              {order?.updatedAt && moment(order?.updatedAt)?.format('LLL')}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider sx={{
        marginTop: '0', marginBottom: '26px', opacity: '1', borderTop: '0'
      }}
      />
      <Grid container columnSpacing={3} position="relative">
        {getOrderDetailLoading ? <LoaderWrapper /> : null}
        <Grid item lg={5} xs={12}>
          <Grid container>
            <Grid lg={5} sm={6} xs={12}>
              <Stack>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Sales channel
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order?.salesChannel ? PLATFORMS[order?.salesChannel] : '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Marketplace Order ID
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order.marketplaceOrderId
                    ? order.sale === 'Phone Order'
                      ? order.marketplaceOrderId
                      : (
                        <a
                          onClick={(e) => handleClickMarketPlace({
                            e,
                            id: order.marketplaceOrderId,
                            salesChannel: PLATFORMS[order.salesChannel]
                          })}
                          href="#"
                          target="_blank"
                          color="#3C76FF"
                          rel="noreferrer"
                        >
                          {order.marketplaceOrderId}
                        </a>
                      )
                    : '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  ORDER RECEIVED ON
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order?.purchaseDate
                    ? moment(order.purchaseDate).format('ddd, Do MMM YYYY')
                    : '--'}
                  {' '}
                </Box>
              </Stack>
            </Grid>
            <Grid lg={5} sm={6} xs={12}>
              <Stack>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Customer Name
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {orderCustomerDetail?.customerName || '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  SHIPPING ADDRESS
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  <Box mb={1}>
                    {
                      PLATFORMS[order.salesChannel] !== 'Phone Order'
                        ? orderCustomerDetail?.shippingInfo?.name || '--'
                        : orderCustomerDetail?.customerName || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {
                      ([
                        orderCustomerDetail?.shippingInfo?.streetAddress || '',
                        orderCustomerDetail?.shippingInfo?.city || '',
                        orderCustomerDetail?.shippingInfo?.state || '',
                        orderCustomerDetail?.shippingInfo?.zipCode || '',
                        orderCustomerDetail?.shippingInfo?.country || ''
                      ].filter((address) => address).join(', ')) || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {
                      PLATFORMS[order.salesChannel] !== 'Phone Order'
                        ? orderCustomerDetail?.shippingInfo?.phoneNo || '--'
                        : orderCustomerDetail?.phoneNumber || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {PLATFORMS[order.salesChannel] !== 'Phone Order'
                      ? orderCustomerDetail?.shippingInfo?.email
                        ? orderCustomerDetail?.shippingInfo?.email.length > 40 ? (
                          <Tooltip arrow title={orderCustomerDetail?.shippingInfo?.email}>
                            <a
                              // style={{
                              //   overflow: 'hidden',
                              //   textOverflow: 'ellipsis',
                              //   display: 'inline-block',
                              //   maxWidth: '100%'
                              // }}
                              fontSize="13px"
                              color="#3C76FF"
                              href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                            >
                              {orderCustomerDetail?.shippingInfo?.email}
                            </a>
                          </Tooltip>
                        ) : (
                          <a
                            // style={{
                            //   overflow: 'hidden',
                            //   textOverflow: 'ellipsis',
                            //   display: 'inline-block',
                            //   maxWidth: '100%'
                            // }}
                            fontSize="13px"
                            color="#3C76FF"
                            href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                          >
                            {orderCustomerDetail?.shippingInfo?.email}
                          </a>
                        ) : (
                          '--'
                        )
                      : orderCustomerDetail?.email
                        ? orderCustomerDetail?.email.length > 40 ? (
                          <Tooltip arrow title={orderCustomerDetail?.email}>
                            <a
                              // style={{
                              //   overflow: 'hidden',
                              //   textOverflow: 'ellipsis',
                              //   display: 'inline-block',
                              //   maxWidth: '100%'
                              // }}
                              fontSize="13px"
                              color="#3C76FF"
                              href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                            >
                              {orderCustomerDetail?.email}
                            </a>
                          </Tooltip>
                        ) : (
                          <a
                            // style={{
                            //   overflow: 'hidden',
                            //   textOverflow: 'ellipsis',
                            //   display: 'inline-block',
                            //   maxWidth: '100%'
                            // }}
                            fontSize="13px"
                            color="#3C76FF"
                            href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                          >
                            {orderCustomerDetail?.email}
                          </a>
                        )
                        : '--'}
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={7}>
          <Stack mb={3}>
            <Box color="#979797" fontSize="11px" textTransform="uppercase" display="flex" alignItems="center" gap="4px">
              SHIP BY DATE
              {
                PLATFORMS[order.salesChannel] === 'VC Purchase Orders'
                  ? (
                    <Box
                      component="span"
                      className="icon-edit cursor-pointer"
                      onClick={() => {
                        setShipDate(true);
                      }}
                    />
                  )
                  : null
              }
            </Box>
            <Box mt={0.75} color="#272B41" fontSize="13px">
              {
                order?.shipBy
                  ? moment(order?.shipBy).format('ddd, Do MMM YYYY')
                  : '--'
              }
              {' '}
            </Box>
          </Stack>
          <EditShipByModal
            show={shipDate}
            onClose={() => {
              setShipDate(false);
              setUpdateShipByDateError('');
            }}
            helperText={updateShipByDateError}
            date={updatedShipByDate}
            handleDateChange={handleShipDateChange}
            onConfirm={handleSaveShipDate}
            loading={updateOrderLoading}
          />
          <Stack mb={3}>
            <Box color="#979797" fontSize="11px" textTransform="uppercase">
              DELIVERY BY DATE
            </Box>
            <Box mt={0.75} color="#272B41" fontSize="13px">
              {order?.deliverBy
                ? moment(order?.deliverBy).format('ddd, Do MMM YYYY')
                : '--'}
            </Box>
          </Stack>
          <Box display="flex" mb={3}>
            <Box display="flex" alignItems="center" className="step-active">
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <CheckCircleOutlineOutlinedIcon
                  sx={{
                    fontSize: '16px',
                    color: '#0FB600',
                    marginRight: '8px'
                  }}
                />
                <Box component="span" display="flex" flexWrap="nowrap" alignItems="center" fontWeight="600" color="#979797"
                >
                  Imported Order
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: '16px',
                      color: '#3C76FF',
                      marginLeft: '3px',
                      marginTop: '-3px'
                    }}
                  />
                </Box>
              </Box>
              <Divider className='steps-divider' />
            </Box>
            <Box display="flex" alignItems="center" className="step-active">
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <Box component="span" mr={1} className="icon-checkCircle" fontSize={16}>
                  <span className="path1" />
                  <span className="path2" />
                </Box>
                <Box component="span" fontWeight="600" color="#272B41">
                  Printed
                </Box>
              </Box>
              <Divider className='steps-divider' />
            </Box>
            <Box display="flex" alignItems="center">
              <Box display="flex" flexWrap="wrap" alignItems="center">
                <CheckCircleOutlineOutlinedIcon
                  sx={{
                    fontSize: '16px',
                    color: '#979797',
                    marginRight: '8px'
                  }}
                />
                <Box
                  component="span"
                  fontWeight="600"
                  color="#979797"
                  mr={-0.125}
                >
                  Picked
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginY: '24px', opacity: '1' }} />
      <Box display="flex" justifyContent="center" gap={3} mb={3}>
        <div>
          <BarcodeReader
            onScan={(e) => {
              setUpc(e);
              setScannedBarcode(true);
              handleAddBoxItem(e);
            }}
          />
        </div>
        <SearchInput
          autoComplete="off"
          fontSize="16px"
          large
          placeholder="Scan Or Enter a UPC To Continue"
          height="40px"
          sx={{ maxWidth: '796px' }}
          width="796px"
          value={upc}
          onChange={(e) => {
            if (editOrders) {
              setUpc(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (editOrders) {
              if (e.keyCode === 13) {
                handleAddBoxItem();
              }
              setUpc(e.target.value);
            }
          }}
        />
        <Box
          sx={{ border: '1px solid #3C76FF' }}
          padding={2.05}
          borderRadius={1}
          className="pointer"
          onClick={() => {
            if (editOrders) {
              handleAddBoxItem();
            }
          }}
        >
          <span className="icon-scanner" />
        </Box>
      </Box>
      <Grid container columnSpacing={3}>
        <Grid item md={8}>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Alert className="alert-workflow" icon={<WarningOutlinedIcon />} severity="warning">The workflow will automatically to Print Label once all items are verified.</Alert>
            <Button
              disabled={!editOrders}
              startIcon={<span className="icon-products" />}
              text="Create Box"
              width="127px"
              onClick={() => {
                resetValues();
                setCreateBox(true);
              }}
            />
          </Stack>
          <Box mt={3} position="relative">
            <Table
              fixed
              alignCenter
              tableHeader={orderedWorkflowHeader}
              height="635px"
              bodyPadding="8px 12px"
              className="order-workflow-table"
              sortableHeader={sortOrderedWorkflowHeader}
              handleSort={handleSortChange}
              sortValue={sortValue}
            >
              {itemsOfProcessOrderLoading ? <LoaderWrapper /> : null}
              {localItemsOfProcessOrder?.length ? (
                localItemsOfProcessOrder?.map((row) => (
                  <TableRow
                    hover
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={{ minWidth: 290, width: '35%' }}>
                      <Stack direction="row" spacing={1}>
                        {row?.primaryImageUrl
                          ? (
                            <HoverImage
                              image={
                                GetS3ImageUrl({
                                  bucketName: 'productImage',
                                  key: row?.primaryImageUrl
                                })
                              }
                            >
                              <img
                                width={40}
                                height={40}
                                onError={(e) => handleImageError(e, Product)}
                                src={GetS3ImageUrl({
                                  bucketName: 'productImage',
                                  key: row?.primaryImageUrl
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
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            maxWidth="250px"
                            display="block"
                          >
                            {row?.title?.length > 30 ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row?.title}
                              >
                                <span>
                                  {row?.title}
                                </span>
                              </Tooltip>
                            ) : (
                              <span>
                                {row?.title || '--'}
                              </span>
                            )}
                          </Box>
                          <Stack spacing={1} direction="row" fontSize="10px">
                            <Box component="span" color="#979797">
                              UPC:
                              <Box
                                component="span"
                                color="#5A5F7D"
                                ml={0.3}
                              >
                                {row?.primaryUpc || '--'}
                              </Box>
                            </Box>
                            <Box component="span" color="#979797">
                              Stock Number:
                              <Box component="span" color="#5A5F7D" ml={0.3}>
                                {row?.stockNumber || '--'}
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{row?.orderItemQuantity || 0}</TableCell>
                    <TableCell>{row?.boxedQuantity || 0}</TableCell>
                    <TableCell>
                      <Input
                        isError
                        name="boxedQuantity"
                        disabled={!row?.isEdit}
                        value={row?.isEdit
                          ? editItem?.boxedQuantity || ''
                          : row?.boxedQuantity || 0}
                        width="69px"
                        marginBottom="0px"
                        onChange={(e) => {
                          if (REGEX_FOR_NUMBERS.test(e.target.value)
                            && Number(e.target.value <= row?.orderItemQuantity)) {
                            let { boxedQuantity } = editItem;
                            boxedQuantity = e.target.value;
                            editItem.boxedQuantity = boxedQuantity;
                            setEditItem(editItem);
                            handleOnchange();
                          } else {
                            e.target.value = editItem?.boxedQuantity;
                          }
                        }}
                        helperText={editItemHelperText?._id === row?.orderItemId
                          && editItemHelperText.boxedQuantity}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={2}>
                        <Box
                          disabled={row?.isEdit}
                          className={`icon-${row?.isEdit ? 'Save color-primary' : 'edit'} pointer`}
                          onClick={() => {
                            if (editOrders) {
                              const findEdited = localItemsOfProcessOrder
                                ?.map((item) => item?.isEdit);
                              const alreadyEdit = findEdited?.includes(true);
                              if (row.isEdit) {
                                if (!editItemHelperText?._id) {
                                  row.isEdit = !row.isEdit;
                                  setIsEdit(!isEdit);
                                  handleEditItem();
                                }
                              } else if (!alreadyEdit) {
                                row.isEdit = !row.isEdit;
                                setIsEdit(!isEdit);
                                setEditItem({ ...row });
                              }
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : !itemsOfProcessOrderLoading && totalItemsOfProcessOrder === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="280px">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box mt={0.125}>
            <Box component="h3" marginBottom={3.225} mt={1.5}>Boxes</Box>
            <Box position="relative">
              <Box className="order-workflow-boxes">
                {boxesLoading || addItemLoading
                  ? <LoaderWrapper />
                  : localOrderBoxes?.length
                    ? localOrderBoxes?.map((item) => {
                      const itemsInBox = boxItems?.filter((obj) => obj?.boxId === item?._id
                        && obj?.productQuantity > 0);
                      return (
                        <Box key={item?._id} mb={1.5} padding="15px 16px" pb="14px" border="1px solid #D9D9D9" alignItems="center" borderRadius="4px" display="flex" gap={16 / 8} justifyContent="space-between">
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
                          <Stack>
                            <Box
                              component="span"
                              color="#3C76FF"
                              className="pointer"
                              fontSize="13px"
                              onClick={() => {
                                setScannedBarcode(true);
                                setOrderNo(true);
                                setOpenBox(item);
                              }}
                            >
                              {itemsInBox?.length || '--'}

                            </Box>
                            <Box
                              component="span"
                              color="#979797"
                              fontSize="10px"
                              pt={0.25}
                            >
                              MSKUS

                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            {/* <Box component="span" color="#5A5F7D" fontSize="13px" sx={{ cursor: 'pointer' }}>
                              <ReactSVG src={WorflowActionPrimary} />
                            </Box>
                            <Box
                              component="span"
                              color="#979797"
                              fontSize="10px"
                              sx={{ cursor: 'pointer' }}
                            >
                              <ReactSVG src={WorflowActionSecondary} />
                            </Box> */}
                            <Tooltip
                              placement="top-start"
                              arrow
                              title="View activity logs"
                            >
                              <Box
                                component="span"
                                color="#979797"
                                fontSize="10px"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setScannedBarcode(true);
                                  setOpenLogs(true);
                                  setOpenBox(item);
                                }}
                              >
                                <InfoOutlinedIcon
                                  sx={{
                                    fontSize: '16px',
                                    color: '#3C76FF'
                                  }}
                                />
                              </Box>
                            </Tooltip>
                            <Tooltip
                              placement="top-start"
                              arrow
                              title="Edit box"
                            >
                              <Box
                                component="span"
                                color="#979797"
                                fontSize="14px"
                                lineHeight="16px"
                                className="icon-edit"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                  if (editOrders) {
                                    setScannedBarcode(false);
                                    resetValues();
                                    setCreateBox(true);
                                    setEditBox(item);
                                    resetValues();
                                  }
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              placement="top-start"
                              arrow
                              title="Delete box"
                            >
                              <Box
                                component="span"
                                color="#979797"
                                fontSize="14px"
                                lineHeight="16px"
                                className={`icon-trash ${!isEmpty(item?.trackingNo) && 'disabled'}`}
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                  if (isEmpty(item?.trackingNo)) {
                                    if (editOrders) {
                                      setDeleteItems(true);
                                      setSelectedBox(item);
                                    }
                                  }
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </Box>
                      );
                    }) : !boxesLoading && (
                      <TableRow>
                        <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                          <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="280px">
                            {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <OrderNo
        open={orderNo}
        onClose={() => {
          setScannedBarcode(true);
          setOrderNo(false);
          setOpenBox(null);
        }}
        openBox={openBox}
        customerDetail={orderCustomerDetail}
        orderNo={order?.orderNumber}
        setOpenLogs={setOpenLogs}
      />
      <CreateBox
        open={createBox}
        onClose={() => {
          dispatch(SetProcessOrderState({
            field: 'openModal',
            value: {}
          }));
          setCreateBox(false);
          setEditBox({});
        }}
        marketplaceOrderId={order?.marketplaceOrderId || ''}
        orderId={orderId}
        orderNo={order?.orderNumber}
        customerDetail={orderCustomerDetail}
        isEdit={!isEmpty(editBox)}
        editBox={editBox}
        salesChannel={order?.salesChannel}
        itemsInBox={boxItems?.filter((obj) => obj?.boxId === editBox?._id)}
        setEditBox={setEditBox}
        scannedBarcode={scannedBarcode}
      />
      <ItemDelete
        show={deleteItems}
        lastTitle="Delete This Box!"
        onClose={() => {
          setSelectedBox({});
          setDeleteItems(false);
        }}
        onDelete={deleteBoxById}
        loading={deleteBoxLoading}
      />
      <BoxLogs
        onOpen={openLogs}
        box={openBox}
        onClose={() => {
          setScannedBarcode(true);
          setOpenBox({});
          setOpenLogs(false);
        }}
      />
    </>
  );
};

export default OrderWorkFlow;
