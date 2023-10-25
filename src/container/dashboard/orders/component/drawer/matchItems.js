import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, isEmpty, camelCase } from 'lodash';
import {
  Box, Stack, TableRow, TableCell, Tooltip
} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RemoveRedEye } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import Drawer from '../../../../../components/drawer';
import HoverImage from '../../../../../components/imageTooltip';
import LoaderWrapper from '../../../../../components/loader/index';
import Pagination from '../../../../../components/pagination/index';
import SearchInput from '../../../../../components/searchInput';
import Select from '../../../../../components/select';
import Table from '../../../../../components/ag-grid-table';
import Popover from '../../../../../components/popover/index';

import { GetPackItems, SetPackState } from '../../../../../redux/slices/pack-slice';

import NoProductImg from '../../../../../static/images/no-product-image.svg';

import {
  addOrderItemHeader, packItem, packComponentHeader, matchItemHeaderSort
} from '../../../../../constants';

import { GetS3ImageUrl } from '../../../../../../utils/helpers';

import { GetMatchItems, MarkItemAsMatched, SetOrderState } from '../../../../../redux/slices/order/order-slice';
import { SetOtherState } from '../../../../../redux/slices/other-slice';

const MatchItems = (props) => {
  const {
    onClose,
    open,
    orderItemId,
    platform,
    sku
  } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    getMatchItemsLoading,
    totalMatchItems,
    matchItems
  } = useSelector((state) => state.order);

  const {
    user: {
      permissions: {
        editOrders = false
      } = {}
    }
  } = useSelector((state) => state.auth);

  const {
    loading: packLoading,
    totalItemsInPack,
    packItems,
    packDetailProductId: packProductId
  } = useSelector((state) => state.pack);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [matchItemsData, setMatchItemsData] = useState([]);

  const [filters, setFilters] = useState({
    searchByKeyWords: {
      title: '',
      mfgPartNo: '',
      stockNumber: '',
      upc: ''
    },
    isPacked: 'all'
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [packDetailsData, setPackDetailsData] = useState([]);
  const [packDetailProductId, setPackDetailProductId] = useState(null);
  const [packItemPagination, setPackItemPagination] = useState({
    pageLimit: 2,
    pageNumber: 1
  });

  const [sortValue, setSortValue] = useState({});

  let modalOpen = false;
  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'simple-popover' : undefined;

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

  function createData(
    _id,
    itemDetails,
    mfgPartNo,
    cost,
    sellPrice,
    supplier,
    isPacked,
    stock,
    location,
    action
  ) {
    return {
      _id,
      itemDetails,
      mfgPartNo,
      cost,
      sellPrice,
      supplier,
      isPacked,
      stock,
      location,
      action
    };
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

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const getMatchItems = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetMatchItems({
      skip, limit, filters, sortBy: sortValue
    }));
  };

  const handleSearch = debounce((key, value) => {
    setPageNumber(1);
    setFilters({
      ...filters,
      searchByKeyWords: {
        ...filters.searchByKeyWords,
        [key]: value
      }
    });
  }, 500);

  const handleMatchItem = ({
    productId
  }) => {
    dispatch(SetOtherState({
      field: 'stockJobProgress',
      value: 0
    }));
    dispatch(MarkItemAsMatched({
      orderItemId,
      sku,
      productId,
      platform
    }));
    onClose();
  };

  const handlePackChange = (e) => {
    setPageNumber(1);
    setFilters({
      ...filters,
      isPacked: e.target.value
    });
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

  const handleAnchorElClose = () => {
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

  useEffect(() => {
    if (!isEmpty(packDetailProductId)) {
      getPackItems();
    }
  }, [packDetailProductId, packItemPagination]);

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
                  onError={(e) => handlePackImageError(e, NoProductImg)}
                >
                  <img
                    width={32}
                    height={32}
                    alt=""
                    onError={(e) => handlePackImageError(e, NoProductImg)}
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
                  onError={(e) => handlePackImageError(e, NoProductImg)}
                  src={NoProductImg}
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
    getMatchItems();
  }, [pageNumber, pageLimit, filters, sortValue]);

  useEffect(() => {
    if (matchItems.length > 0) {
      const matchItemsList = matchItems.map((item) => (
        createData(
          item._id,
          <Stack direction="row" spacing={1}>
            {item?.images?.primaryImageUrl
              ? (
                <HoverImage
                  image={GetS3ImageUrl({
                    bucketName: 'productImage',
                    key: item?.images?.primaryImageUrl
                  })}
                  onError={(e) => handleImageError(e, NoProductImg)}
                >
                  <img
                    width={40}
                    height={40}
                    onError={(e) => handleImageError(e, NoProductImg)}
                    src={GetS3ImageUrl({
                      bucketName: 'productImage', key: item.images?.primaryImageUrl
                    })}
                    alt=""
                  />
                </HoverImage>
              ) : (
                <img
                  width={40}
                  height={40}
                  src={NoProductImg}
                  alt=""
                />
              )}
            <Box>
              <Box
                component="span"
                className="product-name-clamp"
              >
                {item.title?.length > 30
                  ? (
                    <Tooltip
                      placement="top-start"
                      arrow
                      title={item.title}
                    >
                      <span>
                        {item.title || '--'}
                      </span>
                    </Tooltip>
                  )
                  : (
                    <span>
                      {item.title || '--'}
                    </span>
                  )}

              </Box>
              <Stack spacing={1} direction="row" fontSize="10px">
                <Box component="span" color="#979797">
                  UPC:
                  <Box component="span" color="#5A5F7D" ml={0.3}>{item.primaryUpc || '--'}</Box>
                </Box>
                <Box component="span" color="#979797">
                  Stock Number:
                  <Box component="span" color="#5A5F7D" ml={0.3}>{item.stockNumber || '--'}</Box>
                </Box>
              </Stack>
            </Box>
          </Stack>,
          item.mfgPartNo || '--',
          item.costPrice ? `$${Number(item.costPrice).toFixed(2)}` : '$0.00',
          item.salePrice ? `$${Number(item.salePrice).toFixed(2)}` : '$0.00',
          item.supplier || '--',
          item.isPacked,
          item.quantityInStock ? item.quantityInStock : '--',
          item.location || '--',
          <Box>
            <AddCircleOutlineOutlinedIcon
              className="pointer"
              sx={{ color: '#3C76FF', fontSize: '16px' }}
              onClick={() => {
                if (editOrders) {
                  handleMatchItem({
                    productId: item._id
                  });
                }
              }}
            />

          </Box>
        )
      ));
      setMatchItemsData(matchItemsList);
    } else {
      setMatchItemsData([]);
    }
  }, [matchItems]);

  return (
    <Drawer open={open} width="1144px" close={onClose}>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Box component="span" className="icon-left pointer" onClick={onClose} />
          <h2 className="m-0 pl-2">Match Item</h2>
        </Box>
        <Box display="flex" gap="14px">
          <Select
            vertical
            label="Pack/Non Pack:"
            value={filters.isPacked}
            placeholder="Select"
            menuItem={packItem}
            width="80px"
            handleChange={handlePackChange}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Title"
            width="155px"
            onChange={(e) => {
              handleSearch('title', e.target.value);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by UPC"
            width="155px"
            onChange={(e) => {
              handleSearch('upc', e.target.value);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by Stock #"
            width="155px"
            onChange={(e) => {
              handleSearch('stockNumber', e.target.value);
            }}
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by MFG Part #"
            width="180px"
            onChange={(e) => {
              handleSearch('mfgPartNo', e.target.value);
            }}
          />
        </Box>
      </Box>
      <Box mt={3}>
        <Table
          tableHeader={addOrderItemHeader}
          height="115px"
          bodyPadding="8px 12px"
          sortableHeader={matchItemHeaderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {
            getMatchItemsLoading ? <LoaderWrapper />
              : matchItemsData.length > 0
                ? (matchItemsData.map((row) => (
                  <TableRow
                    hover
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box component="span" display="flex" alignItems="center" gap={1.5}>
                        {row.itemDetails}
                      </Box>
                    </TableCell>
                    <TableCell>{row.mfgPartNo}</TableCell>
                    <TableCell>{row.cost}</TableCell>
                    <TableCell>{row.sellPrice}</TableCell>
                    <TableCell>{row.supplier}</TableCell>
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
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                )))
                : (
                  <TableRow>
                    <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                      <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                        {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                      </Box>
                    </TableCell>
                  </TableRow>
                )
          }

        </Table>
        <Pagination
          componentName="orders"
          perPageRecord={matchItems?.length || 0}
          total={totalMatchItems}
          offset={totalMatchItems}
          totalPages={Math.ceil(totalMatchItems / pageLimit)}
          position="relative"
          width="0"
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>

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

    </Drawer>
  );
};

export default MatchItems;
