import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, camelCase } from 'lodash';
import {
  Box, Stack, TableRow, TableCell, Tooltip
} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import Drawer from '../../../../../components/drawer';
import HoverImage from '../../../../../components/imageTooltip';
import LoaderWrapper from '../../../../../components/loader/index';
import Pagination from '../../../../../components/pagination/index';
import SearchInput from '../../../../../components/searchInput';
import Table from '../../../../../components/ag-grid-table';

import NoProductImg from '../../../../../static/images/no-product-image.svg';

import {
  updateOrderItemHeader, updateOrderItemHeaderSort
} from '../../../../../constants';

import { GetS3ImageUrl } from '../../../../../../utils/helpers';

import { GetMatchItems, SetOrderNotifyState, UpdateMatchedItem } from '../../../../../redux/slices/order/order-slice';
import { SetOtherState } from '../../../../../redux/slices/other-slice';

const UpdateItems = (props) => {
  const {
    onClose,
    open,
    orderItemId,
    productId: prevProductId
  } = props;

  const dispatch = useDispatch();

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
    isPacked: 'noPack'
  });

  const [sortValue, setSortValue] = useState({});

  function createData(
    _id,
    itemDetails,
    mfgPartNo,
    cost,
    sellPrice,
    supplier,
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

  const handleUpdateItem = ({
    productId
  }) => {
    dispatch(SetOtherState({
      field: 'stockJobProgress',
      value: 0
    }));

    if (String(prevProductId) === String(productId)) {
      dispatch(SetOrderNotifyState({ message: 'Already same product mapped', type: 'info' }));
      return;
    }
    dispatch(UpdateMatchedItem({
      orderItemId,
      productId
    }));
    onClose();
  };

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
          item.quantityInStock || '--',
          item.location || '--',
          <Box>
            <AddCircleOutlineOutlinedIcon
              className="pointer"
              sx={{ color: '#3C76FF', fontSize: '16px' }}
              onClick={() => {
                if (editOrders) {
                  handleUpdateItem({
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
          <h2 className="m-0 pl-2">Update Item</h2>
        </Box>
        <Box display="flex" gap="14px">
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
          tableHeader={updateOrderItemHeader}
          height="115px"
          bodyPadding="8px 12px"
          sortableHeader={updateOrderItemHeaderSort}
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
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                )))
                : (
                  <TableRow>
                    <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                      <Box
                        textAlign="center"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="calc(100vh - 266px)"
                      />
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
    </Drawer>
  );
};

export default UpdateItems;
