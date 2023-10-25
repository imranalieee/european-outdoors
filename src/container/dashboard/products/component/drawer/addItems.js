import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import {
  debounce, difference, camelCase
} from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// component
import SearchInput from '../../../../../components/searchInput/index';
import Button from '../../../../../components/button/index';
import CheckBox from '../../../../../components/checkbox/index';
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
import Pagination from '../../../../../components/pagination/index';
import HoverImage from '../../../../../components/imageTooltip';
import LoaderWrapper from '../../../../../components/loader';
// redux
import {
  SetProductState,
  GetItemsForPack
} from '../../../../../redux/slices/product-slice';
import { AddItemsToPack, SetPackState } from '../../../../../redux/slices/pack-slice';
// Images
import Product from '../../../../../static/images/no-product-image.svg';

// constants
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
import { itemsPackHeader, itemsPackHeaderSort } from '../../../../../constants/index';

const AddItems = ({ isOpen, onClose, productId }) => {
  const dispatch = useDispatch();

  const {
    itemsForPack,
    totalItemsForPack,
    getItemsForPackLoading
  } = useSelector((state) => state.product);

  const {
    packAdded,
    addPackItemLoading
  } = useSelector((state) => state.pack);

  const [packFilters, setPackFilters] = useState({
    status: 'all',
    searchByKeyWords: {
      keys: ['title', 'stockNumber', 'mfgPartNo'],
      value: ['', '', '']
    }
  });
  const [packPageNumber, setPackPageNumber] = useState(1);
  const [packPageLimit, setPackPageLimit] = useState(100);
  const [searchPackTitle, setSearchPackTitle] = useState('');
  const [searchPackStockNumber, setSearchPackStockNumber] = useState('');
  const [searchPackMfgNumber, setSearchPackMfgNumber] = useState('');
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [addItemsToPackList, setAddItemsToPackList] = useState([]);
  const [addItemToPack, setAddItemToPack] = useState(false);
  const [singleAddAction, setSingleAddAction] = useState(false);

  const [itemsIdList, setItemsIdList] = useState([]);

  const [sortValue, setSortValue] = useState({});

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handlePackPageLimit = (e) => {
    setPackPageLimit(e);
    setPackPageNumber(1);
  };

  const handlePackPageNumber = (e) => {
    setPackPageNumber(e);
  };

  const handlePackSearch = debounce((values, key) => {
    setPackPageNumber(1);
    if (key === 'title') {
      setPackFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [values, searchPackStockNumber, searchPackMfgNumber]
        }
      });
    }
    if (key === 'stockNumber') {
      setPackFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [searchPackTitle, values, searchPackMfgNumber]
        }
      });
    }
    if (key === 'mfgNumber') {
      setPackFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [searchPackTitle, searchPackStockNumber, values]
        }
      });
    }
  }, 500);

  const handleHeaderCheckBoxClicked = (e) => {
    const itemsListForPack = itemsForPack.map((item) => (item._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      setAddItemsToPackList([...addItemsToPackList, ...itemsListForPack]);
    } else {
      const filteredItemsListForPack = addItemsToPackList.filter(
        (id) => !itemsListForPack.includes(id)
      );

      setHeaderCheckBox(false);
      setAddItemsToPackList(filteredItemsListForPack);
    }
  };

  const handleCheckBoxClick = (e, itemId) => {
    if (e.target.checked) {
      setAddItemsToPackList([
        ...addItemsToPackList,
        itemId
      ]);
    } else {
      const filterAddItemsList = addItemsToPackList.filter((id) => id !== itemId);
      setAddItemsToPackList([...filterAddItemsList]);
    }
  };

  const getItemsForPack = () => {
    const skip = (packPageNumber - 1) * packPageLimit;
    const limit = packPageLimit;
    dispatch(GetItemsForPack({
      skip, limit, packFilters, productId, sortBy: sortValue
    }));
  };

  const handleAddItemsToPack = () => {
    if (addItemsToPackList.length) {
      dispatch(AddItemsToPack({ productId, items: addItemsToPackList, action: 'addItemsToPack' }));
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
    }

    setSortValue({
      [sortKey]: newSortValue
    });
  };

  useEffect(() => {
    if (itemsForPack?.length) {
      const idsList = itemsForPack.map((row) => row._id);

      if (addItemsToPackList.length && difference(addItemsToPackList, idsList).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);

      const isSubset = idsList.every((item) => addItemsToPackList.includes(item));

      if (isSubset) {
        setHeaderCheckBox(true);
      } else {
        setHeaderCheckBox(false);
      }

      setItemsIdList(idsList);
    } else {
      setHeaderCheckBox(false);
      setItemsIdList([]);
    }
  }, [itemsForPack]);

  useEffect(() => {
    if (addItemsToPackList?.length && difference(itemsIdList, addItemsToPackList).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [addItemsToPackList]);

  useEffect(() => {
    if (productId) getItemsForPack();
  }, [packFilters, packPageNumber, packPageLimit, sortValue]);

  const handleCloseAddItemsToPack = () => {
    setAddItemsToPackList([]);
    setAddItemToPack(false);
    setHeaderCheckBox(false);
    setSingleAddAction(false);
    setItemsIdList([]);
  };

  useEffect(() => () => {
    dispatch(SetProductState({ field: 'itemsForPack', value: [] }));
    dispatch(SetProductState({ field: 'totalItemsForPack', value: 0 }));
  }, []);

  useEffect(() => {
    if (packAdded) {
      onClose();
      handleCloseAddItemsToPack();
      dispatch(SetPackState({ field: 'packAdded', value: false }));
    }
  }, [packAdded]);

  useEffect(() => {
    if (singleAddAction && addItemsToPackList.length === 1) {
      handleAddItemsToPack();
    }
  }, [singleAddAction, addItemsToPackList]);

  return (
    <Drawer open={isOpen} width="1144px" close={() => { onClose(); handleCloseAddItemsToPack(); }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={() => { onClose(); handleCloseAddItemsToPack(); }}
          />
          <h2 className="m-0 pl-2">Add Items To Pack</h2>
        </Stack>
        <Stack direction="row" spacing={2.125}>
          <SearchInput
            autoComplete="off"
            value={searchPackTitle}
            onChange={(e) => {
              setSearchPackTitle(e.target.value); handlePackSearch(e.target.value, 'title');
            }}
            placeholder="Search by Title"
            sx={{ width: '204px' }}
          />
          <SearchInput
            autoComplete="off"
            value={searchPackStockNumber}
            onChange={(e) => { setSearchPackStockNumber(e.target.value); handlePackSearch(e.target.value, 'stockNumber'); }}
            placeholder="Search by Stock #"
            sx={{ width: '165px' }}
          />
          <SearchInput
            autoComplete="off"
            value={searchPackMfgNumber}
            onChange={(e) => { setSearchPackMfgNumber(e.target.value); handlePackSearch(e.target.value, 'mfgNumber'); }}
            placeholder="Search by MFG Part #"
            sx={{ width: '192px' }}
          />
          <Button
            startIcon={<AddCircleOutlineOutlinedIcon />}
            text="Add Selected items"
            disabled={addItemsToPackList.length === 0 || addItemToPack}
            onClick={() => { setAddItemToPack(true); handleAddItemsToPack(); }}
          />
        </Stack>
      </Stack>
      <Box mt={3.125}>
        {getItemsForPackLoading || addPackItemLoading ? <LoaderWrapper /> : null}
        <Table
          tableHeader={itemsPackHeader}
          checkbox
          height="139px"
          bodyPadding="11px 10px"
          isChecked={headerCheckBox}
          sortableHeader={itemsPackHeaderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
          onChange={(e) => handleHeaderCheckBoxClicked(e)}
        >
          {getItemsForPackLoading ? <LoaderWrapper /> : null}
          {itemsForPack?.length ? itemsForPack.map((row) => (
            <TableRow
              hover
              key={row._id || ''}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Box component="span" display="flex" alignItems="center" gap={1.5}>
                  <CheckBox
                    marginBottom="0"
                    className="body-checkbox"
                    checked={addItemsToPackList.includes(String(row._id)) && !singleAddAction}
                    onChange={(e) => {
                      handleCheckBoxClick(e, row._id);
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    {row.images?.primaryImageUrl ? (
                      <HoverImage
                        image={GetS3ImageUrl({
                          bucketName: 'productImage', key: row?.images?.primaryImageUrl
                        })}
                        onError={(e) => handleImageError(e, Product)}
                      >
                        <img
                          width={40}
                          height={40}
                          onError={(e) => handleImageError(e, Product)}
                          src={GetS3ImageUrl({
                            bucketName: 'productImage', key: row.images?.primaryImageUrl
                          })}
                          alt=""
                        />
                      </HoverImage>
                    )
                      : (
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
                        sx={{ textOverflow: 'auto', whiteSpace: 'nowrap', overflow: 'auto' }}
                        maxWidth="200px"
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
                          <Box component="span" color="#5A5F7D" ml={0.3}>{row.primaryUpc || '--'}</Box>
                        </Box>
                        <Box component="span" color="#979797">
                          Stock Number:
                          <Box component="span" color="#5A5F7D" ml={0.3}>{row.stockNumber}</Box>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </TableCell>
              <TableCell>{row.mfgPartNo || '--'}</TableCell>
              <TableCell>{`$${Number(row.costPrice || 0)?.toFixed(2)}`}</TableCell>
              <TableCell>{`$${Number(row.salePrice || 0)?.toFixed(2)}`}</TableCell>
              <TableCell>{row.supplier?.code || '--'}</TableCell>
              <TableCell>{row.quantityInStock || '--'}</TableCell>
              <TableCell>{row.location || '--'}</TableCell>

              <TableCell
                align="right"
              >
                <AddCircleOutlineOutlinedIcon
                  disabled={addItemToPack && singleAddAction}
                  className="pointer"
                  color="primary"
                  sx={{ fontSize: 16 }}
                  onClick={() => {
                    if (!addItemToPack) {
                      setAddItemToPack(true);
                      setSingleAddAction(true);
                      setAddItemsToPackList([row._id]);
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          )) : null }
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={itemsForPack?.length || 0}
          width="0%"
          total={totalItemsForPack}
          totalPages={Math.ceil(totalItemsForPack / packPageLimit)}
          offset={totalItemsForPack}
          pageNumber={packPageNumber}
          pageLimit={packPageLimit}
          handlePageLimitChange={handlePackPageLimit}
          handlePageNumberChange={handlePackPageNumber}
          position="relative"
        />
      </Box>
    </Drawer>
  );
};

export default AddItems;
