import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import { debounce, isEmpty, camelCase } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// component
import Drawer from '../../../../../components/drawer/index';
import HoverImage from '../../../../../components/imageTooltip';
import LoaderWrapper from '../../../../../components/loader';
import Pagination from '../../../../../components/pagination/index';
import SearchInput from '../../../../../components/searchInput/index';
import Table from '../../../../../components/ag-grid-table/index';
// Redux
import { GetRelationalProducts, SetProductState, UpdateProduct } from '../../../../../redux/slices/product-slice';
// Images
import Product from '../../../../../static/images/no-product-image.svg';
// constants
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
import { relationalProductHeader, relationalProductHeaderSort } from '../../../../../constants/index';

const AddItems = ({
  isOpen, onClose, productId, relationalProduct
}) => {
  const dispatch = useDispatch();

  const {
    loading,
    productUpdated,
    relationalProducts,
    totalRelationalProducts,
    getRelationalProductsLoading
  } = useSelector((state) => state.product);

  const [filters, setFilters] = useState({
    status: 'all',
    searchByKeyWords: {
      keys: ['title', 'stockNumber', 'mfgPartNo'],
      value: ['', '', '']
    }
  });
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [updateRelationProduct, setUpdateRelationProduct] = useState(false);
  const [relationalProductsData, setRelationalProductsData] = useState([]);

  const [sortValue, setSortValue] = useState({});

  const handleImageError = (event, image) => {
    event.target.src = image;
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

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
    dispatch(SetProductState({ field: 'selectedPagination', value: e }));
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const getRelationalProducts = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetRelationalProducts({
      skip, limit, filters, productId, sortBy: sortValue
    }));
  };

  const handleSearch = debounce((values, key) => {
    setPageNumber(1);
    if (key === 'title') {
      setFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [values, searchByStockNumber, searchByMfgNumber]
        }
      });
    }
    if (key === 'stockNumber') {
      setFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [searchByTitle, values, searchByMfgNumber]
        }
      });
    }
    if (key === 'mfgNumber') {
      setFilters({
        status: 'all',
        searchByKeyWords: {
          keys: ['title', 'stockNumber', 'mfgPartNo'],
          value: [searchByTitle, searchByStockNumber, values]
        }
      });
    }
  }, 500);

  const handleCloseRelationalProducts = () => {
    setPageNumber(1);
    setSearchByTitle('');
    setSearchByStockNumber('');
    setSearchByMfgNumber('');
    setFilters({
      status: 'all',
      searchByKeyWords: {
        keys: ['title', 'stockNumber', 'mfgPartNo'],
        value: ['', '', '']
      }
    });

    dispatch(SetProductState({ field: 'relationalProducts', value: [] }));
    dispatch(SetProductState({ field: 'totalRelationalProducts', value: 0 }));

    onClose();
  };

  const handleUpdateRelationProduct = ({ updatedRelationalProductId }) => {
    dispatch(UpdateProduct({
      productId,
      updateParams: {
        relationalProduct: updatedRelationalProductId
      }
    }));
  };

  useEffect(() => {
    getRelationalProducts();
  }, [filters, pageNumber, pageLimit, sortValue]);

  useEffect(() => {
    if (productUpdated) {
      handleCloseRelationalProducts();
      dispatch(SetProductState({ field: 'productUpdated', value: false }));
    }
  }, [productUpdated]);

  useEffect(() => {
    if (relationalProducts?.length) {
      if (!isEmpty(relationalProduct) && relationalProduct.stockNumber) {
        const filterProds = relationalProducts?.filter(
          (item) => item?.stockNumber !== relationalProduct.stockNumber
        );

        const findElement = [relationalProduct, ...filterProds];
        setRelationalProductsData(findElement);
      } else setRelationalProductsData(relationalProducts);
    } else {
      setRelationalProductsData([]);
    }
  }, [relationalProducts]);

  return (
    <Drawer open={isOpen} width="1144px" close={handleCloseRelationalProducts}>
      <Stack direction="row" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={handleCloseRelationalProducts}
          />
          <h2 className="m-0 pl-2">Relational Products</h2>
        </Stack>
        <Stack direction="row" spacing={2}>
          <SearchInput
            autoComplete="off"
            value={searchByTitle}
            onChange={(e) => {
              setSearchByTitle(e.target.value);
              handleSearch(e.target.value, 'title');
            }}
            placeholder="Search by Title"
            sx={{ width: '204px' }}
          />
          <SearchInput
            autoComplete="off"
            value={searchByStockNumber}
            onChange={(e) => {
              setSearchByStockNumber(e.target.value);
              handleSearch(e.target.value, 'stockNumber');
            }}
            placeholder="Search by Stock #"
            sx={{ width: '165px' }}
          />
          <SearchInput
            autoComplete="off"
            value={searchByMfgNumber}
            onChange={(e) => {
              setSearchByMfgNumber(e.target.value);
              handleSearch(e.target.value, 'mfgNumber');
            }}
            placeholder="Search by MFG Part #"
            sx={{ width: '192px' }}
          />
        </Stack>
      </Stack>
      <Box mt={3.125}>
        <Table
          tableHeader={relationalProductHeader}
          bodyPadding="11px 12px" 
          height="136px"
          sortableHeader={relationalProductHeaderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getRelationalProductsLoading || loading ? <LoaderWrapper /> : null}
          {relationalProductsData?.length ? relationalProductsData.map((row) => (
            <TableRow
              hover
              key={row?._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              className={relationalProduct?.stockNumber === row?.stockNumber && pageNumber === 1 ? 'selected' : ''}
            >
              <TableCell component="th" scope="row">
                <Stack direction="row" spacing={1}>
                  {row?.images?.primaryImageUrl
                    ? (
                      <HoverImage
                        image={GetS3ImageUrl({
                          bucketName: 'productImage', key: row?.images?.primaryImageUrl
                        })}
                        onError={(e) => handleImageError(e, Product)}
                      >
                        <img
                          width={32}
                          height={32}
                          onError={(e) => handleImageError(e, Product)}
                          src={GetS3ImageUrl({
                            bucketName: 'productImage', key: row?.images?.primaryImageUrl
                          })}
                          alt=""
                        />
                      </HoverImage>
                    ) : (
                      <img
                        width={32}
                        height={32}
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
                        <Box component="span" color="#5A5F7D" ml={0.3}>{row?.primaryUpc || '--'}</Box>
                      </Box>
                      <Box component="span" color="#979797">
                        Stock Number:
                        <Box component="span" color="#5A5F7D" ml={0.3}>{row?.stockNumber}</Box>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{row?.mfgPartNo}</TableCell>
              <TableCell>{`$${Number(row?.costPrice || 0)?.toFixed(2)}`}</TableCell>
              <TableCell>{`$${Number(row?.salePrice || 0)?.toFixed(2)}`}</TableCell>
              <TableCell>{row?.supplier?.code || '--'}</TableCell>
              <TableCell>{row?.quantityInStock || '--'}</TableCell>
              <TableCell>{row?.location || '--'}</TableCell>
              <TableCell>{row?.pack}</TableCell>
              <TableCell align="right">
                { (row.stockNumber === relationalProduct?.stockNumber && pageNumber === 1)
                  ? (
                    <CancelOutlinedIcon
                      className="pointer"
                      sx={{ color: '#E61F00' }}
                      fontSize="16px"
                      onClick={() => {
                        if (!updateRelationProduct) {
                          setUpdateRelationProduct(true);
                          handleUpdateRelationProduct({ updatedRelationalProductId: '' });
                        }
                      }}
                    />
                  )
                  : (
                    <Box
                      component="span"
                      className="icon-reload1 pointer"
                      fontSize="16px"
                      onClick={() => {
                        if (!updateRelationProduct) {
                          setUpdateRelationProduct(true);
                          handleUpdateRelationProduct({
                            updatedRelationalProductId: row._id
                          });
                        }
                      }}
                    />
                  )}
              </TableCell>
            </TableRow>
          )) : (
            !getRelationalProductsLoading && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={8} align="center">
                  <Box
                    textAlign="center"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="calc(100vh - 237px)"
                  />
                </TableCell>
              </TableRow>

            )
          )}
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={relationalProducts?.length || 0}
          width="0%"
          total={totalRelationalProducts}
          totalPages={Math.ceil(totalRelationalProducts / pageLimit)}
          offset={totalRelationalProducts}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
        />
      </Box>
    </Drawer>
  );
};

export default AddItems;
