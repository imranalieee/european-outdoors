import React, { useState, useEffect } from 'react';
import {
  Stack, Box, Divider, Grid, TableRow, TableCell, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { startCase, debounce, isEmpty, camelCase } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// component
import SearchInput from '../../../../components/searchInput/index';
import Button from '../../../../components/button/index';
import Switch from '../../../../components/switch/index';
import CheckBox from '../../../../components/checkbox/index';
import Input from '../../../../components/inputs/input/index';
import HoverImage from '../../../../components/imageTooltip';
import Drawer from '../../../../components/drawer/index';
import Table from '../../../../components/ag-grid-table/index';
import Select from '../../../../components/select/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader';
import {
  AddNewProduct, SetProductState, GetRelationalProducts
} from '../../../../redux/slices/product-slice';
import {
  GetSuppliers
} from '../../../../redux/slices/supplier-slice';
import {
  SetPackState
} from '../../../../redux/slices/pack-slice';
// constants
import {
  relationalProductHeader, REGEX_FOR_NUMBERS, REGEX_FOR_DECIMAL_NUMBERS, relationalProductHeaderSort
} from '../../../../constants/index';
import { GetS3ImageUrl, ValidateURLForImage, validateUPC } from '../../../../../utils/helpers';
import Product from '../../../../static/images/no-product-image.svg';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { suppliers = [] } = useSelector((state) => state.supplier);
  const {
    productAdded,
    relationalProducts,
    totalRelationalProducts,
    getRelationalProductsLoading
  } = useSelector((state) => state.product);
  const [relationalProduct, setRelationalProduct] = useState(false);
  const [relationalProds, setRelationalProds] = useState([]);
  const [checked, setChecked] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [relationalProductId, setRelationalProductId] = useState('');
  const [relationalProductData, setRelationalProductData] = useState();
  const [filters, setFilters] = useState({
    status: 'all',
    searchByKeyWords: {
      keys: ['title', 'stockNumber', 'mfgPartNo'],
      value: ['', '', '']
    }
  });
  const [sortValue, setSortValue] = useState({});

  const [newProduct, setNewProduct] = useState({
    stockNumber: '',
    mfgPartNo: ''
  });
  const [newProductHelperText, setNewProductHelperText] = useState({
    stockNumber: '',
    mfgPartNo: '',
    primaryUpcError: '',
    secondaryUpcError: ''
  });

  const onChange = (e) => {
    setChecked(e.target.checked);
    if (e.target.checked) {
      setNewProduct({
        ...newProduct,
        isPacked: true
      });
    } else {
      setNewProduct({
        ...newProduct,
        isPacked: false
      });
    }
  };
  const [selected, setSelected] = useState('');

  const getSuppliers = () => {
    dispatch(SetProductState({ field: 'success', value: false }));
    dispatch(GetSuppliers({}));
  };

  const getRelationalProducts = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetRelationalProducts({ skip, limit, filters, sortBy: sortValue }));
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
    getSuppliers();
    return () => {
      if (!(window.location.pathname.startsWith('/products/') || window.location.pathname === '/products')) {
        dispatch(SetProductState({
          field: 'productManagerAdvanceFilters',
          value: {
            searchByKeyWords: {
              title: '',
              stockNumber: '',
              mfgPartNo: '',
              upc: ''
            },
            supplierCode: 'all',
            location: 'all',
            isPacked: 'all',
            costPriceMinValue: '',
            costPriceMaxValue: '',
            salePriceMinValue: '',
            salePriceMaxValue: '',
            stockMinValue: '',
            stockMaxValue: '',
            backOrderMinValue: '',
            backOrderMaxValue: '',
            reservedMinValue: '',
            reservedMaxValue: '',
            onOrderMinValue: '',
            onOrderMaxValue: ''
          }
        }));
        dispatch(SetProductState({ field: 'productManagerPageNumber', value: 1 }));
        dispatch(SetProductState({ field: 'productManagerPageLimit', value: 100 }));
        dispatch(SetProductState({ field: 'packItemsPagination', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageLimit', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageNumber', value: 1 }));
      }
    };
  }, []);

  const supplierItems = suppliers.map((item) => ({
    id: item._id,
    value: item._id,
    label: item.code
  }));

  const handleAddProductChange = (e) => {
    const { value, name: key } = e.target;
    const errors = {};

    if (key === 'primaryImageUrl') {
      if (value) {
        const validUrl = ValidateURLForImage(value);
        if (!validUrl) errors.primaryImageUrl = 'Enter the valid image url';
        else errors.primaryImageUrl = '';
      } else errors.primaryImageUrl = '';
    }

    if (key === 'primaryUpc') {
      if (value) {
        const validUpc = validateUPC(value);
        if (!validUpc) errors.primaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.primaryUpcError = '';
      } else errors.primaryUpcError = '';
    }

    if (key === 'secondaryUpc') {
      if (value) {
        const validUpc = validateUPC(value);
        if (!validUpc) errors.secondaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.secondaryUpcError = '';
      } else errors.secondaryUpcError = '';
    }

    setNewProduct({
      ...newProduct,
      [key]: value
    });
    if ((key === 'stockNumber' || key === 'mfgPartNo') && !value) errors[key] = `${startCase(key)} is required!`;
    else if (key === 'stockNumber' && value) {
      errors[key] = '';
    } else if (key === 'mfgPartNo' && value) {
      errors[key] = '';
    }

    setNewProductHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleCheckBoxClick = (e) => {
    if (e.target.checked) {
      setNewProduct({
        ...newProduct,
        specialMakeup: true
      });
    } else {
      setNewProduct({
        ...newProduct,
        specialMakeup: false
      });
    }
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handleSaveNewProduct = () => {
    const errors = {};
    Object.keys(newProduct).forEach((key) => {
      if (!newProduct[key] && (key === 'stockNumber' || key === 'mfgPartNo')) {
        errors[key] = `${startCase(key)} is required!`;
      } else if (newProduct[key] && (key === 'minimumOq'
        || key === 'costPrice'
        || key === 'salePrice'
        || key === 'mapPrice')) {
        if (!REGEX_FOR_DECIMAL_NUMBERS.test(newProduct[key])) {
          errors[key] = 'Numbers!';
        }
      } else if (!isEmpty((newProduct[key])) && key === 'primaryImageUrl') {
        const validUrl = ValidateURLForImage(newProduct[key]);
        if (!validUrl) errors[key] = 'Enter the valid image url';
        else errors[key] = '';
      } else if (!isEmpty((newProduct[key])) && key === 'primaryUpc') {
        const validUpc = validateUPC(newProduct[key]);
        if (!validUpc) errors[key] = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.primaryUpcError = '';
      } else if (!isEmpty((newProduct[key])) && key === 'secondaryUpc') {
        const validUpc = validateUPC(newProduct[key]);
        if (!validUpc) errors[key] = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.secondaryUpcError = '';
      } else {
        errors[key] = '';
      }
    });
    setNewProductHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
    const findProduct = relationalProds?.find((item) => item?.stockNumber === relationalProductId);
    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      dispatch(AddNewProduct({
        ...newProduct,
        relationalProduct: findProduct?._id
      }));
    }
  };

  useEffect(() => {
    if (productAdded) {
      dispatch(SetProductState({ field: 'productAdded', value: false }));
      navigate('/products');
    }
  }, [productAdded]);

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

  useEffect(() => {
    if (relationalProduct) getRelationalProducts();
  }, [pageNumber, pageLimit, filters.searchByKeyWords.value, relationalProduct, sortValue]);

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
    dispatch(SetProductState({ field: 'selectedPagination', value: e }));
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  useEffect(() => {
    if (relationalProducts) {
      const findElement = [];
      relationalProducts?.map((item) => (
        item?.stockNumber === relationalProductId ? findElement.push(item) : []));
      const filterProds = relationalProducts?.filter(
        (item) => item?.stockNumber !== relationalProductId
      );
      setRelationalProds(findElement.concat(filterProds));
    }
    if (pageNumber === 1 && relationalProductData) {
      const findElement = [];
      findElement.push(relationalProductData);
      const filterProds = relationalProducts?.filter(
        (item) => item?.stockNumber !== relationalProductId
      );
      setRelationalProds(findElement.concat(filterProds));
    }
  }, [relationalProductId, relationalProducts, pageNumber]);

  useEffect(() => {
    if (!relationalProduct) {
      setRelationalProds([]);
      dispatch(SetProductState({ field: 'relationalProducts', value: [] }));
      dispatch(SetProductState({ field: 'totalRelationalProducts', value: 0 }));
    }
  }, [relationalProduct]);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        pt={3}
        pb={3}
        marginTop="-24px"
        mb={3}
        sx={{
          position: 'sticky',
          top: '47.5px',
          zIndex: '999',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgb(151, 151, 151, 0.25)'
        }}
      >
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box compoent="span" className="icon-left pointer" onClick={() => navigate(-1)} />
          <h2 className="m-0 pl-2">Add New Product</h2>
        </Stack>
      </Box>
      <Grid container justifyContent="space-between" alignItems="end" columnSpacing={1}>
        <Grid md={3} item>
          <SearchInput
            autoComplete="off"
            value={relationalProductId}
            placeholder="Relational Product"
            label="Relational Product"
            width="100%"
            sx={{ maxWidth: '309px' }}
            onClick={() => setRelationalProduct(true)}
          />
        </Grid>
        <Grid md={3} item>
          <Box display="flex" textAlign="right" mt={1}>
            <Button
              onClick={handleSaveNewProduct}
              startIcon={<span className=" icon-Save" />}
              text="Save Changes"
            />
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '20px 0' }} />
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={2}>
        <h3 className="m-0">Product Information</h3>
        <Stack direction="row">
          <Switch
            checked={checked}
            onChange={onChange}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: '20px', margin: '0 21px 0px 20px', marginTop: '4px' }}
          />
          <CheckBox
            onClick={(e) => handleCheckBoxClick(e)}
            label="SMU"
            marginBottom="0px"
          />
        </Stack>
      </Stack>
      <Grid container columnSpacing={3} sx={{ marginTop: '10px' }}>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="stockNumber"
            helperText={newProductHelperText.stockNumber}
            onChange={(e) => handleAddProductChange(e)}
            label="Stock Number"
            placeholder="Stock Number"
            width="100%"
            marginBottom="32px"
          />
        </Grid>
        <Grid md={9} item>
          <Input
            autoComplete="off"
            name="title"
            onChange={(e) => handleAddProductChange(e)}
            label="Title"
            width="100%"
            placeholder="Product Title"
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="mfgPartNo"
            helperText={newProductHelperText.mfgPartNo}
            onChange={(e) => handleAddProductChange(e)}
            label="MFG Part No."
            placeholder="MFG Part No."
            width="100%"
            marginBottom="14px"
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="primaryUpc"
            onChange={(e) => handleAddProductChange(e)}
            label="Primary UPC"
            helperText={newProductHelperText.primaryUpcError}
            placeholder="Primary UPC"
            width="100%"
            marginBottom="18px"
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="secondaryUpc"
            helperText={newProductHelperText.secondaryUpcError}
            onChange={(e) => handleAddProductChange(e)}
            label="Secondary UPC"
            placeholder="Secondary UPC"
            width="100%"
            marginBottom="18px"
          />
        </Grid>
        <Grid md={3} item>
          {!newProduct?.isPacked && (
            <Select
              name="supplier"
              handleChange={(e) => handleAddProductChange(e)}
              label="Supplier Code"
              width="100%"
              placeholder="Supplier Code"
              menuItem={supplierItems}
            />
          )}
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="minimumOq"
            value={newProduct.minimumOq}
            onChange={(e) => {
              if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                handleAddProductChange(e);
              } else {
                e.target.value = '';
              }
            }}
            label="MOQ"
            placeholder="MOQ"
            width="100%"
            marginBottom="24px"
            helperText={newProductHelperText.minimumOq}
          />
        </Grid>
      </Grid>
      <Divider sx={{ marginTop: 0, marginBottom: '25px' }} />
      <Box>
        <h3>Pricing</h3>
        <Grid container columnSpacing={3} sx={{ marginTop: '17px' }}>
          <Grid md={3} item>
            <Input
              autoComplete="off"
              name="costPrice"
              value={newProduct.costPrice}
              onChange={(e) => {
                if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                  handleAddProductChange(e);
                } else {
                  e.target.value = '';
                }
              }}
              label="Cost Price"
              placeholder="Cost Price"
              width="100%"
              marginBottom="24px"
              helperText={newProductHelperText.costPrice}
            />
          </Grid>
          <Grid md={3} item>
            <Input
              autoComplete="off"
              name="salePrice"
              value={newProduct.salePrice}
              onChange={(e) => {
                if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                  handleAddProductChange(e);
                } else {
                  e.target.value = '';
                }
              }}
              label="Sell Price"
              placeholder="Sell Price"
              width="100%"
              marginBottom="24px"
              helperText={newProductHelperText.salePrice}
            />
          </Grid>
          <Grid md={3} item>
            <Input
              autoComplete="off"
              name="mapPrice"
              value={newProduct.mapPrice}
              onChange={(e) => {
                if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                  handleAddProductChange(e);
                } else {
                  e.target.value = '';
                }
              }}
              label="MAP Price"
              placeholder="MAP Price"
              width="100%"
              marginBottom="24px"
              helperText={newProductHelperText.mapPrice}
            />
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ marginTop: 0, marginBottom: '25px' }} />
      <h3>Location</h3>
      <Grid container columnSpacing={3} sx={{ marginTop: '17px' }}>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            name="location"
            onChange={(e) => handleAddProductChange(e)}
            label="Location"
            placeholder="Location"
            width="100%"
            marginBottom="24px"
          />
        </Grid>
        <Grid md={9} item>
          <Input
            autoComplete="off"
            name="primaryImageUrl"
            helperText={newProductHelperText.primaryImageUrl}
            onChange={(e) => handleAddProductChange(e)}
            label="Primary Image URL"
            placeholder="Primary Image URL"
            width="100%"
            marginBottom="24px"
          />
        </Grid>
      </Grid>
      <Drawer open={relationalProduct} width="1144px" close={() => setRelationalProduct(false)}>
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box component="span" className="icon-left pointer" onClick={() => setRelationalProduct(false)} />
            <h2 className="m-0 pl-2">Relational Product</h2>
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
            position="relative"
            tableHeader={relationalProductHeader}
            height="112px"
            sortableHeader={relationalProductHeaderSort}
            handleSort={handleSortChange}
            sortValue={sortValue}
          >
            {getRelationalProductsLoading ? <LoaderWrapper /> : null}
            {relationalProds?.map((row, key) => (
              <TableRow
                hover
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                className={row?.stockNumber === relationalProductId ? 'selected' : ''}
                onClick={() => setSelected(key)}
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
                            alt=""
                            onError={(e) => handleImageError(e, Product)}
                            src={GetS3ImageUrl({
                              bucketName: 'productImage', key: row?.images?.primaryImageUrl
                            })}
                          />
                        </HoverImage>
                      ) : (
                        <img
                          width={32}
                          height={32}
                          alt=""
                          onError={(e) => handleImageError(e, Product)}
                          src={Product}
                        />
                      )}
                    <Box>
                      <Box component="span" className="product-name-clamp" sx={{ textOverfow: 'auto', whiteSpace: 'nowrap', overflow: 'auto' }} maxWidth="200px">
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
                <TableCell>{row?.mfgPartNo || '--'}</TableCell>
                <TableCell>{row?.costPrice ? `$${row?.costPrice}` : '--'}</TableCell>
                <TableCell>{row?.salePrice ? `$${row?.salePrice}` : '--'}</TableCell>
                <TableCell>{row?.supplier?.code || '--'}</TableCell>
                <TableCell>{row?.quantityInStock || '--'}</TableCell>
                <TableCell>{row?.location || '--'}</TableCell>
                <TableCell align="right">
                  {relationalProductId === row?.stockNumber
                    ? (
                      <CancelOutlinedIcon
                        className="pointer"
                        sx={{ color: '#E61F00' }}
                        fontSize="16px"
                        onClick={() => {
                          setRelationalProductId('');
                          setRelationalProductData(null);
                        }}
                      />
                    )
                    : (
                      <Box
                        component="span"
                        className="icon-reload1 pointer"
                        fontSize="16px"
                        onClick={() => {
                          setPageNumber(1);
                          setRelationalProductId(row?.stockNumber);
                          setRelationalProductData(row);
                          setRelationalProduct(false);
                        }}
                      />
                    )}

                </TableCell>
              </TableRow>
            ))}
          </Table>
          <Pagination
            componentName="products"
            position="absolute"
            perPageRecord={relationalProducts?.length || 0}
            width="44px"
            total={totalRelationalProducts}
            totalPages={Math.ceil(totalRelationalProducts / pageLimit)}
            offset={totalRelationalProducts}
            pageNumber={pageNumber}
            pageLimit={pageLimit}
            handlePageLimitChange={handlePageLimit}
            handlePageNumberChange={handlePageNumber}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default AddProduct;
