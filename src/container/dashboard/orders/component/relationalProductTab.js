import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

import noProductImg from '../../../../static/images/no-product-image.svg';

import { GetS3ImageUrl } from '../../../../../utils/helpers';
import { GetPackItems, SetPackState } from '../../../../redux/slices/pack-slice';
import {
  GetRelationalOrderItems
} from '../../../../redux/slices/order';

import {
  BADGE_CLASS,
  packComponentHeader,
  relationalProductTabHeader,
  sortRelationalProductTabHeader
} from '../../../../constants/index';

const RelationalProductTab = (props) => {
  const { platform, orderId } = props;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tableRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    getOrderItemsLoading,
    relationalProductList
  } = useSelector((state) => state.order);

  const {
    loading: packLoading,
    packItems,
    packDetailProductId: packProductId
  } = useSelector((state) => state.pack);

  const [matchItems, setMatchItems] = useState(false);
  const [orderItemsData, setOrderItemsData] = useState([]);
  const [sku] = useState('');
  const [orderItemId] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [print, setPrint] = useState(false);
  const [upc, setUpc] = useState('');
  const [sortValue, setSortValue] = useState({});
  const [createdData, setCreatedData] = useState([]);

  const [packDetailsData, setPackDetailsData] = useState([]);
  const [packDetailProductId, setPackDetailProductId] = useState(null);
  const [packItemPagination, setPackItemPagination] = useState({
    pageLimit: 2,
    pageNumber: 1
  });

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

  const createData = (
    _id,
    productId,
    itemDetails,
    mfg,
    quantityInStock,
    matchedStockNumber,
    committedQuantity,
    backOrder,
    onOrder,
    fba,
    reserved,
    price,
    subtotal,
    status,
    pack,
    action
  ) => ({
    _id,
    productId,
    itemDetails,
    mfg,
    quantityInStock,
    matchedStockNumber,
    committedQuantity,
    backOrder,
    onOrder,
    fba,
    reserved,
    price,
    subtotal,
    status,
    pack,
    action
  });

  useEffect(() => {
    if (orderId) {
      dispatch(GetRelationalOrderItems({ orderId }));
    }
  }, [orderId]);

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const getPackItems = () => {
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
    const sortKey = camelCase(header);
    const currentSortValue = sortValue[sortKey];

    let newSortValue;

    if (!currentSortValue) {
      newSortValue = 'asc';
    } else if (currentSortValue === 'asc') {
      newSortValue = 'desc';
    } else {
      newSortValue = '';

      setOrderItemsData(createdData);

      setSortValue((prevSortValue) => ({
        [sortKey]: newSortValue
      }));
      return;
    }

    setSortValue((prevSortValue) => ({
      [sortKey]: newSortValue
    }));

    let sortByValue = '';
    if (sortKey === 'committedQuantity') sortByValue = 'committedQuantity';
    else if (sortKey === 'unitPrice') sortByValue = 'price';
    else if (sortKey === 'quantityInStock') sortByValue = 'quantityInStock';
    else if (sortKey === 'rpStock') sortByValue = 'relationalProductQuantityInStock';
    else if (sortKey === 'pack') sortByValue = 'isPacked';
    else if (sortKey === 'subTotal') sortByValue = 'subtotal';

    const sortedData = orderItemsData?.slice().sort((a, b) => {
      let compareValue;
      if (typeof a[sortByValue] === 'number' && typeof b[sortByValue] === 'number') {
        compareValue = a[sortByValue] - b[sortByValue];
      } else {
        compareValue = a[sortByValue]?.localeCompare(b[sortByValue], undefined, { numeric: true, sensitivity: 'base' });
      }

      return newSortValue === 'asc' ? compareValue : -compareValue;
    });

    setOrderItemsData([...sortedData]);
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
                  onError={(e) => handlePackImageError(e, noProductImg)}
                >
                  <img
                    width={32}
                    height={32}
                    alt=""
                    onError={(e) => handlePackImageError(e, noProductImg)}
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
                    {row.itemId?.title.length
                      ? row.itemId?.title
                      : '--'}
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

  useEffect(() => {
    if (relationalProductList?.length) {
      const orderItemsList = relationalProductList.map((orderItem) => (
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
            ? orderItem.quantityInStock || 0 : 0,
          orderItem.matchedStockNumber || 0,
          orderItem?.fulfilledQuantityDetails?.fulfilledByRelationalSku,
          orderItem.productId
            ? orderItem.backOrderQuantity || 0 : 0,
          orderItem.productId
            ? orderItem.onOrderQuantity || 0 : 0,
          orderItem.productId
            ? orderItem.afnFulfillableQuantity || 0 : 0,
          orderItem.productId
            ? orderItem.reservedQuantity || 0 : 0,
          orderItem?.salePrice ? `$${Number(orderItem?.salePrice).toFixed(2)}` : '$0.00',
          (orderItem?.orderItemQuantity && orderItem?.salePrice) ? `$${+(Number(orderItem?.orderItemQuantity)
            * Number(Number(orderItem?.salePrice).toFixed(2))
          ).toFixed(2)
            }` : '$0.00',
          <Box className={BADGE_CLASS[camelCase(orderItem.status)]}>
            {orderItem.status ? startCase(lowerCase(orderItem.status)) : '--'}
          </Box>,
          orderItem.productId
            ? orderItem.isPacked
            : '--',
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
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
      setCreatedData(orderItemsList);
    } else {
      setOrderItemsData([]);
      setCreatedData([]);
    }
  }, [relationalProductList, platform]);

  useEffect(() => {
    if (upc && print) {
      buttonRef.current.click();
    }
  }, [print]);

  useEffect(() => () => {
    dispatch(SetPackState({ field: 'packItems', value: [] }));
    dispatch(SetPackState({ field: 'packDetailProductId', value: null }));
  }, []);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="mb-0">Relational Product</h3>
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
                  !packLoading && packItems?.length === 0 && (
                    null
                  )
                )
            }
          </Table>
        </Popover>

        <Table
          fixed
          tableHeader={relationalProductTabHeader}
          height="635px"
          bodyPadding="8px 12px"
          className="supplier-details-table"
          sortableHeader={sortRelationalProductTabHeader}
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
                    {row.itemDetails || '--'}
                  </TableCell>
                  <TableCell>{row.mfg || '--'}</TableCell>
                  <TableCell>{row.quantityInStock || '--'}</TableCell>
                  <TableCell style={{ background: row.matchedStockNumber ? 'yellow' : null }}>
                    {row.matchedStockNumber || '--'}
                  </TableCell>
                  <TableCell>{row.committedQuantity || '--'}</TableCell>
                  <TableCell>{row.backOrder || '--'}</TableCell>
                  <TableCell>{row.onOrder || '--'}</TableCell>
                  <TableCell>{row.fba || '--'}</TableCell>
                  <TableCell>{row.reserved || '--'}</TableCell>
                  <TableCell>{row.price || '--'}</TableCell>
                  <TableCell>{row.subtotal || '--'}</TableCell>
                  <TableCell>{row.status || '--'}</TableCell>
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
                  />
                </TableCell>
              </TableRow>
            )}
        </Table>
        {matchItems ? (
          <MatchItems
            open={matchItems}
            onClose={() => setMatchItems(false)}
            sku={sku}
            platform={platform}
            orderItemId={orderItemId}
          />
        ) : null}
      </Box >
      <ReactToPrint
        trigger={() => (
          <button
            ref={buttonRef}
            style={{ display: 'none' }}
          />
        )}
        content={() => tableRef.current}
        onAfterPrint={() => {
          setPrint(false);
        }}
      />
      {
        print
          ? (
            <BarcodeFile
              ref={tableRef}
              value={upc}
            />
          )
          : null
      }
    </>
  );
};

export default RelationalProductTab;
