import React, { useState, useEffect } from 'react';
import {
  Box, Stack, TableCell, TableRow, Grid, Tooltip
} from '@mui/material';
import {
  camelCase
} from 'lodash';
// component
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import Drawer from '../../../../components/drawer/index';
import LoaderWrapper from '../../../../components/loader/index';
import {
  GetProductSupplierDetails, SetProductState
} from '../../../../redux/slices/product-slice';
import {
  GetPackItems
} from '../../../../redux/slices/pack-slice';
// images
import noData from '../../../../static/images/no-data-table.svg';
// constants
import {
  packComponentHeader, sortPackComponentHeader
} from '../../../../constants/index';

const PackComponent = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const {
    productSupplierDetail,
    productSupplierLoading
  } = useSelector((state) => state.product);

  const {
    packItems,
    totalItemsInPack,
    getPackItemLoading,
    packAdded,
    packDeleted,
    totalQuantityInPack,
    totalCostOfPack,
    packItemsEdited
  } = useSelector((state) => state.pack);
  const [supplier, setSupplier] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [allPackItems, setAllPackItems] = useState([]);
  const [pageLimit, setPageLimit] = useState(100);
  const [sortValue, setSortValue] = useState({});

  function createData(
    stockNo,
    mfgPart,
    quanity,
    price,
    addedBy,
    action
  ) {
    return {
      stockNo,
      mfgPart,
      quanity,
      price,
      addedBy,
      action
    };
  }
  const data = [];
  for (let i = 0; i <= 1; i++) {
    data.push(
      createData(
        '6240-0128345085',
        'ZDN282000',
        '23',
        '23 ',
        'AFN',
        <Box className="icon-left-arrow pointer" fontSize="12px" textAlign="right" component="span" onClick={() => setSupplierDetails(true)} />
      )
    );
  }

  const getPackItems = () => {
    const { id: productId } = params;
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;

    dispatch(GetPackItems({
      skip, limit, productId, sortBy: sortValue
    }));
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    if (e !== pageNumber) { setAllPackItems(null); }
    setPageNumber(e);
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
    if (supplier) {
      dispatch(GetProductSupplierDetails({ productId: supplier }));
    }
  }, [supplier]);

  useEffect(() => {
    if (productSupplierDetail) {
      setSupplierData(productSupplierDetail);
    }
  }, [productSupplierDetail]);

  useEffect(() => {
    getPackItems();
    setAllPackItems([]);
  }, [pageNumber, pageLimit, packAdded, packDeleted, packItemsEdited, sortValue]);

  useEffect(() => {
    if (packItems?.length) {
      setAllPackItems(packItems);
      setTotalCost(totalCostOfPack);
      setTotalQuantity(totalQuantityInPack);
    } else {
      setAllPackItems([]);
      setTotalCost(0);
      setTotalQuantity(0);
    }
  }, [packItems]);

  useEffect(() => {
    if (!supplierDetails) {
      setSupplier(null);
      dispatch(SetProductState({ field: 'productSupplierDetail', value: {} }));
    }
  }, [supplierDetails]);

  console.log(allPackItems, '======>>>');

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <Box component="h3" mt={0.5}> Pack Component </Box>
        <Stack spacing={2} direction="row" alignItems="center" mt={-0.875}>
          <Box component="span" color="#5A5F7D">
            Total Quantity:
            <Box component="span" color="#272B41" ml={0.375} fontWeight="600" marginLeft="2px">{totalQuantity || 0}</Box>
          </Box>
          <Box component="span" color="#5A5F7D">
            Total Cost.
            <Box component="span" color="#272B41" ml={0.375} fontWeight="600" marginLeft="2px">
              $
              {Number(totalCost || 0)?.toFixed(2)}
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box mt={2.375} position="relative">
        <Table
          tableHeader={packComponentHeader}
          height="500px"
          sortableHeader={sortPackComponentHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getPackItemLoading
            ? <LoaderWrapper />
            : allPackItems?.length ? allPackItems?.map((row) => (
              <TableRow
                hover
                key={row?.itemId?.title}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{row?.itemId?.stockNumber}</TableCell>
                <TableCell>{row?.itemId?.mfgPartNo}</TableCell>
                <TableCell>{row?.quantity}</TableCell>
                <TableCell>{`$${Number(row?.itemId?.costPrice || 0)?.toFixed(2)}`}</TableCell>
                <TableCell>
                  {row?.userId?.name
                    ? (
                      row?.userId?.name
                    ) : '--'}

                </TableCell>
                <TableCell align="right">
                  <Box
                    className="icon-left-arrow pointer"
                    fontSize="12px"
                    component="span"
                    onClick={() => {
                      setSupplier(row?.itemId?._id);
                      setSupplierDetails(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            )) : (
              !getPackItemLoading && totalItemsInPack === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>

              )
            )}
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={packItems?.length || 0}
          width="0%"
          total={totalItemsInPack}
          totalPages={Math.ceil(totalItemsInPack / pageLimit)}
          offset={totalItemsInPack}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
        />
      </Box>
      <Drawer position="relative" open={supplierDetails} width="555px" close={() => setSupplierDetails(false)}>

        {productSupplierLoading ? <LoaderWrapper /> : null}
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={() => setSupplierDetails(false)} />
          <h2 className="m-0 pl-2">Supplier Details</h2>
        </Stack>
        <Grid container>
          <Grid item md={4}>
            <Stack spacing={0.25} mb={1.75} mt={3.1}>
              <label>Company Name</label>
              <Box component="span" color="#272B41">{supplierData?.companyName || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1}>
              <label>Account #  </label>
              <Box component="span" color="#272B41">{supplierData?.account || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1}>
              <label>Fax #</label>
              <Box component="span" color="#272B41">{supplierData?.fax || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1}>
              <label>State/Province</label>
              <Box component="span" color="#272B41">{supplierData?.state || '--'}</Box>
            </Stack>
          </Grid>
          <Grid item md={4}>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={5.37}>
              <label>Supplier Name</label>
              <Box component="span" color="#272B41">{supplierData?.supplierName || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={5.37}>
              <label>Email Address </label>
              <Box
                component="span"
                color="#272B41"
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                textOverflow="ellipsis"
                maxWidth="200px"
              >
                {
                  supplierData?.email?.length > 17
                    ? (
                      <Tooltip
                        placement="top-start"
                        arrow
                        title={supplierData?.email}
                      >
                        <span>
                          {supplierData?.email}
                        </span>
                      </Tooltip>
                    )
                    : (
                      <span>
                        {supplierData?.email || '--'}
                      </span>
                    )
                }
              </Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={5.37}>
              <label>Street Address</label>
              <Box
                component="span"
                color="#272B41"
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                textOverflow="ellipsis"
                maxWidth="200px"
              >
                {supplierData?.streetAddress?.length > 17
                  ? (
                    <Tooltip
                      placement="top-start"
                      arrow
                      title={supplierData?.streetAddress}
                    >
                      <span>
                        {supplierData?.streetAddress}
                      </span>
                    </Tooltip>
                  )
                  : (
                    <span>
                      {supplierData?.streetAddress || '--'}
                    </span>
                  )}
              </Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={5.37}>
              <label>Zip Code</label>
              <Box component="span" color="#272B41">{supplierData?.zipCode || '--'}</Box>
            </Stack>
          </Grid>
          <Grid item md={4}>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={10}>
              <label>Supplier Code</label>
              <Box component="span" color="#272B41">{supplierData?.code || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={10}>
              <label>Phone # </label>
              <Box component="span" color="#272B41">{supplierData?.phone || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={10}>
              <label>City</label>
              <Box component="span" color="#272B41">{supplierData?.city || '--'}</Box>
            </Stack>
            <Stack spacing={0.25} mb={1.75} mt={3.1} ml={10}>
              <label>Payment Terms</label>
              <Box component="span" color="#272B41">{supplierData?.paymentTerms || '--'}</Box>
            </Stack>
          </Grid>
        </Grid>
      </Drawer>
    </div>
  );
};

export default PackComponent;
