import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  camelCase, lowerCase, startCase, isEmpty
} from 'lodash';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { RemoveRedEye } from '@mui/icons-material';

import HoverImage from '../../../../components/imageTooltip';
import LoaderWrapper from '../../../../components/loader/index';
import MatchItems from './drawer/matchItems';
import Table from '../../../../components/ag-grid-table/index';
import Popover from '../../../../components/popover/index';
import BarcodeFile from './print/barcodeFile';
import UpdateItems from './drawer/updateItems';
import PackOrderItemDetails from './drawer/packOrderItemDetails';

import noProductImg from '../../../../static/images/no-product-image.svg';

import { GetS3ImageUrl } from '../../../../../utils/helpers';
// import { GetPackItems, SetPackState } from '../../../../redux/slices/pack-slice';

import {
  BADGE_CLASS,
  newOrderItemHeader,
  newPhoneOrderItemHeader,
  orderItemPackHeader,
  sortTableByOrderItemsHeader,
  editOrderItemsPackDetailsPermission
} from '../../../../constants/index';

import { GetOrderItems, SetOrderState, GetOrderItemPackItems } from '../../../../redux/slices/order/order-slice';
import { SetOtherState } from '../../../../redux/slices/other-slice';

const ItemOrdered = (props) => {
  const { platform, orderId } = props;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const tableRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    order,
    getOrderItemsLoading,
    viewOrderItems,
    markItemMatched,
    orderStatusUpdated,
    packDetailOrderItemId: packOrderItemId,
    orderItemPackDetail,
    getOrderItemPackItemLoading,
    orderPackItemAdded,
    orderPackItemEdited
  } = useSelector((state) => state.order);

  const {
    stockJobProgress
  } = useSelector((state) => state.other);

  const [matchItems, setMatchItems] = useState(false);
  const [orderItemsData, setOrderItemsData] = useState([]);
  const [sku, setSku] = useState('');
  const [orderItemId, setOrderItemId] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [anchorEl, setAnchorEl] = useState(null);
  const [print, setPrint] = useState(false);
  const [upc, setUpc] = useState('');

  const [packDetailsData, setPackDetailsData] = useState([]);
  const [packDetailOrderItemId, setPackDetailOrderItemId] = useState(null);
  const [updateItems, setUpdateItems] = useState(false);
  const [prevProductId, setPrevProductId] = useState(null);

  const [viewOrderItemPackDetails, setViewOrderItemPackDetails] = useState(false);
  const [viewOrderItemId, setViewOrderItemId] = useState('');

  const [sortValue, setSortValue] = useState({
    // quantityInStock: '',
    // quantityOrdered: '',
    // unitPrice: '',
    // backOrder: '',
    // reserved: '',
    // onOrder: '',
    // rpStock: '',
    // fbaUs: '',
    // subTotal: ''
  });

  const [viewOrderItemsLocalCopy, setViewOrderItemsLocalCopy] = useState([]);

  let modalOpen = false;
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const createPackData = (
    _id,
    product,
    mfgPartNo,
    quantityInStock,
    quantity,
    fulfilledBy,
    costPriceValue,
    status,
    relationProductStockNumber,
    relationalProductQuantityInStock,
    addedBy,
    action
  ) => ({
    _id,
    product,
    mfgPartNo,
    quantityInStock,
    quantity,
    fulfilledBy,
    costPrice: costPriceValue,
    status,
    relationProductStockNumber,
    relationalProductQuantityInStock,
    addedBy,
    action
  });

  const createData = (
    _id,
    productId,
    itemDetails,
    mfg,
    quantityInStock,
    quantityOrdered,
    fulfilledBy,
    committedQuantity,
    backOrder,
    onOrder,
    fba,
    reserved,
    price,
    subtotal,
    marketplaceSku,
    relationalSku,
    relationalQuantityInStock,
    status,
    pack,
    action
  ) => ({
    _id,
    productId,
    itemDetails,
    mfg,
    quantityInStock,
    quantityOrdered,
    fulfilledBy,
    committedQuantity,
    backOrder,
    onOrder,
    fba,
    reserved,
    price,
    subtotal,
    marketplaceSku,
    relationalSku,
    relationalQuantityInStock,
    status,
    pack,
    action
  });

  const getOrderItems = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetOrderItems({
      orderId,
      skip,
      limit,
      pageName: 'viewOrder'
    }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const getOrderItemPackItems = () => {
    dispatch(
      GetOrderItemPackItems({
        orderItemId: packDetailOrderItemId
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
        setPackDetailOrderItemId(null);
        dispatch(SetOrderState({ field: 'orderItemPackDetail', value: [] }));
      }
    }, 0);
  };

  const handleViewPackItemsClick = (event, orderItemPackId) => {
    setPackDetailOrderItemId(orderItemPackId);
    setAnchorEl(event.currentTarget);
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

      setViewOrderItemsLocalCopy(viewOrderItems);

      setSortValue({
        [sortKey]: newSortValue
      });
      return;
    }

    setSortValue({
      [sortKey]: newSortValue
    });

    let sortByValue = '';
    if (sortKey === 'quantityOrdered') sortByValue = 'orderItemQuantity';
    else if (sortKey === 'unitPrice') sortByValue = 'salePrice';
    else if (sortKey === 'quantityInStock') sortByValue = 'quantityInStock';
    else if (sortKey === 'rpStock') sortByValue = 'relationalProductQuantityInStock';
    else if (sortKey === 'pack') sortByValue = 'isPacked';
    else if (sortKey === 'subTotal') sortByValue = 'subtotal';

    const sortedData = viewOrderItems.slice().sort((a, b) => {
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

    setViewOrderItemsLocalCopy([...sortedData]);
  };

  useEffect(() => {
    if (orderItemPackDetail.length) {
      const packItemsData = orderItemPackDetail.map((row) => createPackData(
        row._id,
        <Stack direction="row" spacing={1}>
          <Box sx={{ '&:hover': 'transform: scale(1.5)' }}>
            {row.primaryImageUrl
              ? (
                <HoverImage
                  image={GetS3ImageUrl({
                    bucketName: 'productImage', key: row.primaryImageUrl
                  })}
                  onError={(e) => handlePackImageError(e, noProductImg)}
                >
                  <img
                    width={32}
                    height={32}
                    alt=""
                    onError={(e) => handlePackImageError(e, noProductImg)}
                    src={GetS3ImageUrl({
                      bucketName: 'productImage', key: row.primaryImageUrl
                    })}
                  />
                </HoverImage>
              ) : (
                <img
                  width={32}
                  height={32}
                  alt=""
                  onError={(e) => handlePackImageError(e, noProductImg)}
                  src={noProductImg}
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
                {row.title?.length > 30 ? (
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={row.title}
                  >
                    <span>
                      {row.title}
                    </span>
                  </Tooltip>
                ) : (
                  <span>
                    {row.title.length
                      ? row.title
                      : '--'}
                  </span>
                )}
              </Box>
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.primaryUpc || '--'}
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.stockNumber || '--'}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        row.mfgPartNo || '--',
        row.quantityInStock || '--',
        row.quantity || '--',
        row.fulfilledBy || '--',
        row.costPrice ? `$${+(row.costPrice).toFixed(2)}` : '$0.00',
        <Box className={BADGE_CLASS[camelCase(row.status)]}>
          {row.status ? startCase(lowerCase(row.status)) : '--'}
        </Box>,
        row.relationProductStockNumber,
        row.relationalProductQuantityInStock,
        row.addedBy || '--',
        <Box display="flex" gap={2}>
          <RemoveRedEye
            sx={{ color: '#3C76FF', width: 16 }}
            className="pointer"
            onClick={() => navigate(`/products/${row.productId}`)}
          />
        </Box>
      ));
      setPackDetailsData(packItemsData);
    } else {
      setPackDetailsData([]);
    }
  }, [orderItemPackDetail]);

  useEffect(() => {
    if (!isEmpty(packDetailOrderItemId)) {
      getOrderItemPackItems();
    }
  }, [packDetailOrderItemId]);

  useEffect(() => {
    if (orderId) getOrderItems();
  }, [pageNumber, pageLimit, orderId]);

  useEffect(() => {
    if (orderId && (orderPackItemAdded || orderPackItemEdited)) getOrderItems();
  }, [orderPackItemAdded, orderPackItemEdited]);

  useEffect(() => {
    if (viewOrderItems.length) {
      setViewOrderItemsLocalCopy([...viewOrderItems]);
    } else {
      setViewOrderItemsLocalCopy([]);
    }
  }, [viewOrderItems, platform]);

  useEffect(() => {
    if (viewOrderItemsLocalCopy?.length) {
      const orderItemsList = viewOrderItemsLocalCopy.map((orderItem) => (
        createData(
          orderItem.orderItemId,
          orderItem.productId,
          orderItem.productId
            ? (
              <Stack direction="row" spacing={1}>
                {orderItem.primaryImageUrl
                  ? (
                    <HoverImage
                      image={
                        GetS3ImageUrl({
                          bucketName: 'productImage',
                          key: orderItem.primaryImageUrl
                        })
                      }
                      onError={(e) => handleImageError(e, noProductImg)}
                    >
                      <img
                        width={40}
                        height={40}
                        onError={(e) => handleImageError(e, noProductImg)}
                        src={GetS3ImageUrl({
                          bucketName: 'productImage',
                          key: orderItem.primaryImageUrl
                        })}
                        alt=""
                      />
                    </HoverImage>
                  ) : <img width={40} height={40} src={noProductImg} alt="" />}
                <Box>
                  <Box className="product-name-clamp" component="span">

                    {orderItem.title?.length > 30
                      ? (
                        <Tooltip
                          placement="top-start"
                          arrow
                          title={orderItem.title}
                        >
                          <span>
                            {orderItem.title || '--'}
                          </span>
                        </Tooltip>
                      )
                      : (
                        <span>
                          {orderItem.title || '--'}
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
                        {orderItem.primaryUpc || '--'}
                      </Box>
                    </Box>
                    <Box component="span" color="#979797">
                      Stock Number:
                      <Box component="span" color="#5A5F7D" ml={0.3}>
                        {orderItem.stockNumber || '--'}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <img width={40} height={40} src={noProductImg} alt="" />
                --
              </Stack>
            ),
          orderItem.productId ? (
            <Stack>
              <Box component="span" color="#272B41">
                {orderItem.mfgPartNo || '--'}
              </Box>
            </Stack>
          ) : '--',
          orderItem.productId
            ? orderItem.quantityInStock || '--' : '--',
          <Box component="span" color="#E61F00">
            {orderItem?.orderItemQuantity || '--'}
          </Box>,
          orderItem?.fulfilledBy || '--',

          (orderItem?.fulfilledQuantityDetails?.fulfilledByMatchedSku
            || orderItem?.fulfilledQuantityDetails?.fulfilledByRelationalSku)
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
                        <Box component="span" ml={1}>{orderItem?.fulfilledQuantityDetails?.fulfilledByMatchedSku}</Box>
                      </Box>
                      <Box display="flex">
                        <Box component="strong">
                          Fulfilled By Relational SKU =
                        </Box>
                        <Box component="span" ml={1}>{orderItem?.fulfilledQuantityDetails?.fulfilledByRelationalSku}</Box>
                      </Box>
                    </Box>
                  )}
                >
                  <span>
                    {
                      orderItem?.fulfilledQuantityDetails?.fulfilledByMatchedSku
                      + orderItem?.fulfilledQuantityDetails?.fulfilledByRelationalSku
                    }
                  </span>
                </Tooltip>

              </Box>
            )
            : '--',
          orderItem.productId
            ? orderItem.backOrderQuantity || '--' : '--',
          orderItem.productId
            ? orderItem.onOrderQuantity || '--' : '--',
          orderItem.productId
            ? orderItem.afnFulfillableQuantity || '--' : '--',
          orderItem.productId
            ? orderItem.reservedQuantity || '--' : '--',
          orderItem?.salePrice ? `$${Number(orderItem?.salePrice).toFixed(2)}` : '$0.00',
          orderItem?.subtotal ? `$${Number(orderItem?.subtotal).toFixed(2)}` : '$0.00',
          // (orderItem?.orderItemQuantity && orderItem?.salePrice) ? `$${
          //   +(Number(orderItem?.orderItemQuantity)
          //   * Number(Number(orderItem?.salePrice).toFixed(2))
          //   ).toFixed(2)
          // }` : '$0.00',
          <Box display="flex" flexDirection="column" color="#272B41" gap="2px">
            <Box component="span">
              {orderItem.marketplaceSku || '--'}
            </Box>
            {orderItem.productId
              ? null : (
                <Box
                  component="span"
                  color="#3C76FF"
                  fontSize="10px"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSku(orderItem.marketplaceSku);
                    setOrderItemId(orderItem.orderItemId);
                    setMatchItems(true);
                    dispatch(SetOrderState({
                      field: 'loadOrderItems',
                      value: false
                    }));
                  }}
                >
                  Match Item to System SKU
                </Box>
              )}

            { (orderItem.productId
              && !orderItem.isPacked
               && (editOrderItemsPackDetailsPermission.includes(order.orderStatus)))
              ? (
                <Box
                  component="span"
                  color="#3C76FF"
                  fontSize="10px"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setPrevProductId(orderItem.productId);
                    setOrderItemId(orderItem.orderItemId);
                    setUpdateItems(true);
                    dispatch(SetOrderState({
                      field: 'loadOrderItems',
                      value: false
                    }));
                  }}
                >
                  Update Match Item to System SKU
                </Box>
              ) : null }
          </Box>,
          orderItem.productId
            ? orderItem.relationProductStockNumber || '--' : '--',
          orderItem.productId
            ? orderItem.relationalProductQuantityInStock || '--' : '--',
          <Box className={BADGE_CLASS[camelCase(orderItem.status)]}>
            {orderItem.status ? startCase(lowerCase(orderItem.status)) : '--'}
          </Box>,
          orderItem.productId
            ? orderItem.isPacked
            : '--',
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            {
              orderItem.productId && orderItem.isPacked
                ? (
                  <Box
                    component="span"
                    className={(editOrderItemsPackDetailsPermission.includes(order.orderStatus)) ? 'icon-edit pointer' : 'icon-edit pointer disabled' }
                    onClick={() => {
                      if (editOrderItemsPackDetailsPermission.includes(order.orderStatus)) {
                        setViewOrderItemPackDetails(true);
                        setViewOrderItemId(orderItem.orderItemId);
                      }
                    }}
                  />
                )
                : (
                  null
                )
            }
            {
              orderItem.primaryUpc?.length === 11 || orderItem.primaryUpc?.length === 12
                ? (
                  <Box
                    component="span"
                    className="icon-print pointer"
                    onClick={() => {
                      setUpc(orderItem.primaryUpc);
                      setPrint(true);
                    }}
                  />
                )
                : (
                  <Box
                    component="span"
                    className="icon-print disabled"
                  />
                )
            }
            {
              orderItem.productId
                ? (
                  <Box
                    component="span"
                    className="icon-left-arrow  pointer"
                    onClick={() => navigate(`/products/${orderItem.productId}`)}
                  />

                ) : (
                  <Box
                    component="span"
                    className="icon-left-arrow disabled"
                  />

                )
            }
          </Stack>
        )
      ));
      setOrderItemsData(orderItemsList);
    } else {
      setOrderItemsData([]);
    }
  }, [viewOrderItemsLocalCopy, order]);

  useEffect(() => {
    if (upc && print) {
      buttonRef.current.click();
    }
  }, [print]);

  const handleNotification = () => {
    if (stockJobProgress === 100) {
      dispatch(GetOrderItems({
        orderId: params.id,
        pageName: 'viewOrder'
      }));
      dispatch(SetOtherState({
        field: 'stockJobProgress',
        value: undefined
      }));
    }
  };

  useEffect(() => {
    if (markItemMatched) {
      setSortValue({});
      dispatch(SetOrderState({ field: 'markItemMatched', value: false }));
    }
  }, [markItemMatched]);

  useEffect(() => {
    handleNotification();
  }, [stockJobProgress]);

  useEffect(() => {
    if (orderStatusUpdated) {
      getOrderItems();
      dispatch(SetOrderState({ field: 'orderStatusUpdated', value: false }));
    }
  }, [orderStatusUpdated]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="mb-0">Item Ordered</h3>
      </Box>
      <Box mt={3} position="relative">
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
            tableHeader={orderItemPackHeader}
            bodyPadding="8px 11px"
          >
            {
              getOrderItemPackItemLoading ? <LoaderWrapper /> : null
            }

            { packDetailsData?.length ? packDetailsData.map((row) => (
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
                <TableCell>{row.quantityInStock }</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.fulfilledBy}</TableCell>
                <TableCell>{row.costPrice}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.relationProductStockNumber || '--'}</TableCell>
                <TableCell>{row.relationalProductQuantityInStock || '--'}</TableCell>
                <TableCell>{row.addedBy}</TableCell>
                <TableCell align="right">{row.action}</TableCell>
              </TableRow>
            ))
              : null}
          </Table>
        </Popover>

        <Table
          fixed
          tableHeader={platform === 'phoneOrder' ? newPhoneOrderItemHeader : newOrderItemHeader}
          height="635px"
          bodyPadding="8px 12px"
          className="supplier-details-table"
          sortableHeader={sortTableByOrderItemsHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {' '}
          {getOrderItemsLoading ? <LoaderWrapper />
            : orderItemsData.length ? (
              orderItemsData.map((row) => (
                <TableRow
                  hover
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.itemDetails}
                  </TableCell>
                  <TableCell>{row.mfg}</TableCell>
                  <TableCell>{row.quantityInStock}</TableCell>
                  <TableCell>{row.quantityOrdered}</TableCell>
                  <TableCell>{row.fulfilledBy}</TableCell>
                  <TableCell>{row.committedQuantity}</TableCell>
                  <TableCell>{row.backOrder}</TableCell>
                  <TableCell>{row.onOrder}</TableCell>
                  <TableCell>{row.fba}</TableCell>
                  <TableCell>{row.reserved}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.subtotal}</TableCell>
                  {
                    platform === 'phoneOrder' ? null
                      : <TableCell>{row.marketplaceSku}</TableCell>
                  }
                  <TableCell>{row.relationalSku}</TableCell>
                  <TableCell>{row.relationalQuantityInStock}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    {row.productId ? row?.pack ? (
                      <CheckCircleIcon
                        aria-describedby={id}
                        onMouseEnter={(e) => handleViewPackItemsClick(e, row._id)}
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
                    ) : '--'}
                  </TableCell>
                  {/* <TableCell>{row.pack}</TableCell> */}
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  sx={{ borderBottom: '24px' }}
                  colSpan={14}
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
        {/* <Pagination
          componentName="others"
          perPageRecord={viewOrderItems?.length || 0}
          total={viewTotalOrderItems}
          offset={viewTotalOrderItems}
          totalPages={Math.ceil(viewTotalOrderItems / pageLimit)}
          position="relative"
          width="0"
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        /> */}
        {matchItems ? (
          <MatchItems
            open={matchItems}
            onClose={() => setMatchItems(false)}
            sku={sku}
            platform={platform}
            orderItemId={orderItemId}
          />
        ) : null}

        {
          updateItems ? (
            <UpdateItems
              open={updateItems}
              onClose={() => setUpdateItems(false)}
              productId={prevProductId}
              orderItemId={orderItemId}
            />
          ) : null
        }
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
      {
         viewOrderItemPackDetails
           ? (
             <PackOrderItemDetails
               open={viewOrderItemPackDetails}
               onClose={() => setViewOrderItemPackDetails(false)}
               orderItemId={viewOrderItemId}
             />
           )
           : null
       }
    </>
  );
};
export default ItemOrdered;
