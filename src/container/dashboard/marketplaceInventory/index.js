import { debounce, extend, camelCase } from 'lodash';
import {
  Box, TableRow, TableCell, Tooltip
} from '@mui/material';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { utils, read } from 'xlsx';
// components
import Button from '../../../components/button/index';
import LoaderWrapper from '../../../components/loader/index';
import Pagination from '../../../components/pagination/index';
import SearchInput from '../../../components/searchInput/index';
import Select from '../../../components/select';
import Table from '../../../components/ag-grid-table/index';
import UploadModal from './modals/upload';
// redux
import {
  GetMarketplaceInventory,
  SaveUploadedInventorySheetInDb,
  SaveUploadedMarketplaceMappingSheetInDb,
  SetMarketplaceInventoryState,
  SetMarketplaceInventoryNotifyState
} from '../../../redux/slices/marketplace-inventory-slice';
import { GetS3PreSignedUrl, SetOtherState } from '../../../redux/slices/other-slice';
// helper
import { UploadDocumentOnS3 } from '../../../../utils/helpers';
// constants
import {
  ebayInventoryHeader,
  MARKETPLACE_LIST,
  MarketplaceIdMapping,
  sellerCentralInventoryHeader,
  vCInventoryHeader,
  walmartInventoryHeader
} from '../../../constants/index';
// Images
import noData from '../../../static/images/no-data-table.svg';
import ProductHeaderWrapper from '../products/style';

const headerFormat = ['marketplaceSku', 'asin', 'title', 'upc'];
const mappingHeaderFormat = ['marketplace', 'marketplaceSku', 'stockNumber', 'controlInventoryYN'];

const Index = () => {
  const dispatch = useDispatch();

  const {
    marketplaceInventory,
    totalMarketplaceInventory,
    getMarketplaceInventoryLoading,
    marketplaceInventoryFilters: {
      marketplaceInventoryPageNumber,
      marketplaceInventoryPageLimit,
      marketplace,
      sellerCentralFilters,
      walmartFilters,
      ebayFilters,
      vcDirectFulFillmentFilters
    },
    marketplaceInventoryFilters,
    saveInventoryJobTriggeredLoading,
    success,
    saveInventoryJobTriggered
  } = useSelector((state) => state.marketplaceInventory);

  const {
    preSignedUrl,
    fileUploadKey
  } = useSelector((state) => state.other);

  const {
    user: { userId }
  } = useSelector((state) => state.auth);

  const [uploadFile, setUploadFile] = useState(false);
  const [validUploadInventory, setValidUploadInventory] = useState(false);
  const [validUploadMapping, setValidUploadMapping] = useState(false);

  const [attachmentName, setAttachmentName] = useState('');
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const [searchBySellerSku, setSearchBySellerSku] = useState('');
  const [searchByAsin, setSearchByAsin] = useState('');
  const [searchByUpc, setSearchByUpc] = useState('');
  const [searchByItemId, setSearchByItemId] = useState('');
  const [uploadMappingFile, setUploadMappingFile] = useState('');

  const getMarketplaceInventory = () => {
    const skip = (marketplaceInventoryPageNumber - 1) * marketplaceInventoryPageLimit;
    const limit = marketplaceInventoryPageLimit;

    dispatch(
      GetMarketplaceInventory({
        skip,
        limit,
        filters: {
          marketplace,
          sellerCentralFilters,
          walmartFilters,
          ebayFilters,
          vcDirectFulFillmentFilters
        }
      })
    );
  };

  const handlePageLimit = (e) => {
    dispatch(SetMarketplaceInventoryState({
      field: 'marketplaceInventoryFilters',
      value: {
        ...marketplaceInventoryFilters,
        marketplaceInventoryPageNumber: 1,
        marketplaceInventoryPageLimit: e
      }
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetMarketplaceInventoryState({
      field: 'marketplaceInventoryFilters',
      value: {
        ...marketplaceInventoryFilters,
        marketplaceInventoryPageNumber: e
      }
    }));
  };

  const handleFiltersChange = debounce((e) => {
    const { name, value } = e.target;

    const filterObj = { ...marketplaceInventoryFilters, marketplaceInventoryPageNumber: 1 };
    if (marketplace === 'ebay') {
      extend(filterObj, {
        ebayFilters: {
          ...ebayFilters,
          [name]: value
        }
      });
    } else if (marketplace === 'walmart') {
      extend(filterObj, {
        walmartFilters: {
          ...walmartFilters,
          [name]: value
        }
      });
    } else if (marketplace === 'sellerCentral') {
      extend(filterObj, {
        sellerCentralFilters: {
          ...sellerCentralFilters,
          [name]: value
        }
      });
    } else if (marketplace === 'vendorCentralDirectFulFillment') {
      extend(filterObj, {
        vcDirectFulFillmentFilters: {
          ...vcDirectFulFillmentFilters,
          [name]: value
        }
      });
    }

    dispatch(SetMarketplaceInventoryState({
      field: 'marketplaceInventoryFilters',
      value: filterObj
    }));
  }, 500);

  const handleMarketplaceChange = (e) => {
    const { value } = e.target;

    setSearchByUpc('');
    setSearchByItemId('');
    setSearchByAsin('');
    setSearchBySellerSku('');
    dispatch(SetMarketplaceInventoryState({
      field: 'marketplaceInventoryFilters',
      value: {
        ...marketplaceInventoryFilters,
        marketplace: value,
        marketplaceInventoryPageNumber: 1,
        sellerCentralFilters: { sellerSku: '', asin: '', upc: '' },
        walmartFilters: { sellerSku: '', itemId: '' },
        ebayFilters: { upc: '', sellerSku: '' },
        vcDirectFulFillmentFilters: { sellerSku: '', upc: '', asin: '' }
      }
    }));
  };

  const validateHeaders = (target, pattern) => {
    target = target.map((value) => camelCase(value.toLowerCase().trim()));

    let isHeadersOk = true;
    for (let i = 0; i < pattern?.length; i += 1) {
      const headerValue = pattern[i];
      isHeadersOk = target.includes(headerValue);

      if (!isHeadersOk) break;
    }
    return isHeadersOk;
  };

  const handleUploadInventorySheetClose = () => {
    setUploadFile(false);
    setAttachment(null);
    setAttachmentName('');
    setAttachmentLoading(false);
  };

  const handleUploadMappingSheetClose = () => {
    setUploadMappingFile(false);
    setAttachment(null);
    setAttachmentName('');
    setAttachmentLoading(false);
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];
      const fileName = file.name.split('.')[0];

      const extensionFile = file.name.split('.').pop();

      if (extensionFile !== 'csv' && extensionFile !== 'xlsx') {
        dispatch(
          SetMarketplaceInventoryNotifyState({
            message: 'Supported extension is csv && xlsx'
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async (event) => {
        const fileData = event.target.result;

        const workbook = read(fileData, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const inventoryData = utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (inventoryData && inventoryData?.length) {
          const fileHeaders = Object.keys(inventoryData[0]);

          const headerFormatValidated = validateHeaders(
            fileHeaders,
            headerFormat
          );

          if (headerFormatValidated) {
            setAttachment(file);
            setAttachmentName(fileName);
            setValidUploadInventory(true);
          } else {
            dispatch(
              SetMarketplaceInventoryNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetMarketplaceInventoryNotifyState({
              message: 'Sheet is empty',
              type: 'error'
            })
          );
        }
      };
    }
  };

  const handleChangeMappingAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];
      const fileName = file.name.split('.')[0];

      const extensionFile = file.name.split('.').pop();

      if (extensionFile !== 'csv' && extensionFile !== 'xlsx') {
        dispatch(
          SetMarketplaceInventoryNotifyState({
            message: 'Supported extension is csv && xlsx'
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async (event) => {
        const fileData = event.target.result;

        const workbook = read(fileData, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const mappingData = utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (mappingData && mappingData?.length) {
          const fileHeaders = Object.keys(mappingData[0]);

          const headerFormatValidated = validateHeaders(
            fileHeaders,
            mappingHeaderFormat
          );

          if (headerFormatValidated) {
            setAttachment(file);
            setAttachmentName(fileName);
            setValidUploadMapping(true);
          } else {
            dispatch(
              SetMarketplaceInventoryNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetMarketplaceInventoryNotifyState({
              message: 'Sheet is empty',
              type: 'error'
            })
          );
        }
      };
    }
  };

  const handleSaveAttachment = () => {
    const extension = attachment.name.split('.').pop();
    if (extension !== 'csv' && extension !== 'xlsx') {
      dispatch(
        SetMarketplaceInventoryNotifyState({ message: 'Supported extension is csv && xlsx' })
      );
      return;
    }
    const formattedFileName = attachmentName.replace(/\s/g, '-');

    if (validUploadInventory) {
      setAttachmentLoading(true);

      dispatch(
        GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format(
            'YYYY-MM-DD HH:mm:ss'
          )}.${extension}`,
          fileType: attachment.type,
          fileExtension: extension,
          uploadBucket: 'marketplaceInventory',
          id: 'vc-directfulfillment-inventory'
        })
      );
    } else {
      setAttachmentName('');
      setAttachment(null);
      setValidUploadInventory(false);
      dispatch(
        SetMarketplaceInventoryNotifyState({
          message: 'Upload Attachment is not valid',
          type: 'error'
        })
      );
    }
  };

  const handleSaveMappingAttachment = () => {
    const extension = attachment.name.split('.').pop();
    if (extension !== 'csv' && extension !== 'xlsx') {
      dispatch(
        SetMarketplaceInventoryNotifyState({ message: 'Supported extension is csv && xlsx' })
      );
      return;
    }
    const formattedFileName = attachmentName.replace(/\s/g, '-');

    if (validUploadMapping) {
      setAttachmentLoading(true);

      dispatch(
        GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format(
            'YYYY-MM-DD HH:mm:ss'
          )}.${extension}`,
          fileType: attachment.type,
          fileExtension: extension,
          uploadBucket: 'marketplaceInventory',
          id: 'marketplace-inventory-mapping'
        })
      );
    } else {
      setAttachmentName('');
      setAttachment(null);
      setValidUploadMapping(false);
      dispatch(
        SetMarketplaceInventoryNotifyState({
          message: 'Upload Attachment is not valid',
          type: 'error'
        })
      );
    }
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({
      preSignedUrl,
      file: attachment
    });

    if (response) {
      if (uploadFile) {
        dispatch(
          SaveUploadedInventorySheetInDb({
            userId,
            fileUploadKey
          })
        );
      } else if (uploadMappingFile) {
        dispatch(
          SaveUploadedMarketplaceMappingSheetInDb({
            userId,
            fileUploadKey
          })
        );
      }
    } else {
      setAttachmentLoading(false);
      dispatch(
        SetMarketplaceInventoryNotifyState({
          message: 'File uploading failed on S3',
          type: 'error'
        })
      );
    }
  };

  useEffect(() => {
    if (success && saveInventoryJobTriggered) {
      if (attachmentLoading) {
        setAttachmentLoading(false);
        setAttachmentName('');
        setUploadFile(false);
        setUploadMappingFile(false);
        setAttachment(null);
        setValidUploadInventory(false);
        setValidUploadMapping(false);

        dispatch(SetMarketplaceInventoryState({ field: 'saveInventoryJobTriggered', value: false }));
        dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      }
    }
    if (!success && !saveInventoryJobTriggeredLoading && attachmentLoading) {
      dispatch(SetMarketplaceInventoryState({ field: 'saveInventoryJobTriggered', value: false }));
      dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      setAttachmentLoading(false);
    }
  }, [success, saveInventoryJobTriggeredLoading]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (marketplaceInventoryPageNumber && marketplaceInventoryPageLimit) getMarketplaceInventory();
  }, [marketplaceInventoryFilters]);

  useEffect(() => () => {
    dispatch(SetMarketplaceInventoryState({
      field: 'marketplaceInventoryFilters',
      value: {
        marketplaceInventoryPageNumber: 1,
        marketplaceInventoryPageLimit: 100,
        marketplace: 'sellerCentral',
        sellerCentralFilters: { sellerSku: '', asin: '', upc: '' },
        walmartFilters: { sellerSku: '', itemId: '' },
        ebayFilters: { upc: '', sellerSku: '' },
        vcDirectFulFillmentFilters: { sellerSku: '', upc: '', asin: '' }
      }
    }));
    dispatch(SetMarketplaceInventoryState({ field: 'marketplaceInventory', value: [] }));
    dispatch(SetMarketplaceInventoryState({ field: 'totalMarketplaceInventory', value: 0 }));
  }, []);

  return (
    <>
     <ProductHeaderWrapper>
     <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <h2 className="m-0"> Marketplace Inventory</h2>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
          <Select
            vertical
            label="By Marketplace"
            value={marketplaceInventoryFilters.marketplace}
            placeholder="Select"
            menuItem={MARKETPLACE_LIST}
            width="188px"
            name="marketplace"
            handleChange={handleMarketplaceChange}
            helperText=""
          />

          {marketplace === 'vendorCentralDirectFulFillment' || marketplace === 'ebay'
            ? (
              <SearchInput
                autoComplete="off"
                placeholder="Search by UPC"
                width="165px"
                name="upc"
                value={searchByUpc}
                onChange={(e) => {
                  setSearchByUpc(e.target.value);
                  handleFiltersChange(e);
                }}
              />
            )
            : null}

          <SearchInput
            autoComplete="off"
            placeholder="Search by Seller Sku"
            width="170px"
            name="sellerSku"
            value={searchBySellerSku}
            onChange={(e) => {
              setSearchBySellerSku(e.target.value);
              handleFiltersChange(e);
            }}
          />

          {marketplace === 'sellerCentral' || marketplace === 'vendorCentralDirectFulFillment'
            ? (
              <SearchInput
                autoComplete="off"
                placeholder="Search by Asin"
                width="170px"
                name="asin"
                value={searchByAsin}
                onChange={(e) => {
                  setSearchByAsin(e.target.value);
                  handleFiltersChange(e);
                }}
              />
            )

            : null}
          {marketplace === 'walmart'
            ? (
              <SearchInput
                autoComplete="off"
                placeholder="Search by Item Id"
                width="170px"
                name="itemId"
                value={searchByItemId}
                onChange={(e) => {
                  setSearchByItemId(e.target.value);
                  handleFiltersChange(e);
                }}
              />
            )
            : null}

          {marketplace === 'vendorCentralDirectFulFillment'
            ? (
              <Button
                startIcon={<span className="icon-union" />}
                className="icon-button"
                tooltip="Vendor Central Inventory Bulk Upload"
                onClick={() => setUploadFile(true)}
              />
            )
            : null}

          <Button
            startIcon={<span className="icon-union" />}
            className="icon-button"
            tooltip="Mapping Bulk Upload"
            onClick={() => setUploadMappingFile(true)}
          />
        </Box>
      </Box>
     </ProductHeaderWrapper>

      <Box mt={3}>
        {marketplace === 'sellerCentral'
          ? (
            <Table
              fixed
              height="164px"
              bodyPadding="8px 11px"
              alignCenter
              tableHeader={sellerCentralInventoryHeader}
            >
              {getMarketplaceInventoryLoading ? <LoaderWrapper /> : null}

              { marketplaceInventory?.length ? marketplaceInventory.map((row) => (
                <TableRow
                  hover
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box className="product-name-clamp" component="span">
                      {row?.title?.length > 60
                        ? (
                          <Tooltip
                            placement="top-start"
                            arrow
                            title={row?.title}
                          >
                            <span>{row.title}</span>
                          </Tooltip>
                        )
                        : (
                          <span>
                            {row?.title || '--'}
                          </span>
                        )}
                    </Box>
                  </TableCell>
                  <TableCell>{row.marketplaceId ? MarketplaceIdMapping[row.marketplaceId] : '--'}</TableCell>
                  <TableCell>{row.sku || '--'}</TableCell>
                  <TableCell>{row.asin || '--'}</TableCell>
                  <TableCell>{row.fulfillmentType || '--'}</TableCell>
                  <TableCell>{row.quantity || '--'}</TableCell>
                </TableRow>
              )) : (
                !getMarketplaceInventoryLoading && totalMarketplaceInventory === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
                )
              )}
            </Table>
          )
          : null}

        {marketplace === 'ebay'
          ? (
            <Table
              fixed
              height="164px"
              bodyPadding="8px 11px"
              alignCenter
              tableHeader={ebayInventoryHeader}
            >
              {
                getMarketplaceInventoryLoading
                  ? <LoaderWrapper />
                  : marketplaceInventory?.length ? marketplaceInventory.map((row) => (
                    <TableRow
                      hover
                      key={row._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box className="product-name-clamp" component="span">

                          {row.title?.length > 60
                            ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row?.title}
                              >
                                <span>{row.title}</span>
                              </Tooltip>
                            )
                            : (
                              <span>
                                {row?.title || '--'}
                              </span>
                            )}
                        </Box>
                      </TableCell>
                      <TableCell>{row.sku || '--'}</TableCell>
                      <TableCell>{row.upc || '--'}</TableCell>
                      <TableCell>{row.quantity || '--'}</TableCell>
                    </TableRow>
                  )) : (
                    !getMarketplaceInventoryLoading && totalMarketplaceInventory === 0 && (
                      <TableRow>
                        <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                          <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                            {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  )
              }
            </Table>
          )

          : null}

        {marketplace === 'walmart'
          ? (
            <Table
              fixed
              height="164px"
              bodyPadding="8px 11px"
              alignCenter
              tableHeader={walmartInventoryHeader}
            >
              {
                getMarketplaceInventoryLoading
                  ? <LoaderWrapper />
                  : marketplaceInventory?.length ? marketplaceInventory.map((row) => (
                    <TableRow
                      hover
                      key={row._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box className="product-name-clamp" component="span">

                          {row.title?.length > 60
                            ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row?.title}
                              >
                                <span>{row.title}</span>
                              </Tooltip>
                            )
                            : (
                              <span>
                                {row.title || '--'}
                              </span>
                            )}
                        </Box>
                      </TableCell>
                      <TableCell>{row.itemId || '--'}</TableCell>
                      <TableCell>{row.sku || '--'}</TableCell>
                      <TableCell>{row.quantity || '--'}</TableCell>
                    </TableRow>
                  )) : (
                    !getMarketplaceInventoryLoading && totalMarketplaceInventory === 0 && (
                      <TableRow>
                        <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                          <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                            {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  )
              }
            </Table>
          )
          : null}

        {marketplace === 'vendorCentralDirectFulFillment'
          ? (
            <Table
              fixed
              height="164px"
              bodyPadding="8px 11px"
              alignCenter
              tableHeader={vCInventoryHeader}
            >
              {
                getMarketplaceInventoryLoading
                  ? <LoaderWrapper />
                  : marketplaceInventory?.length ? marketplaceInventory.map((row) => (
                    <TableRow
                      hover
                      key={row._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box className="product-name-clamp" component="span">

                          {row?.title?.length > 60
                            ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row?.title}
                              >
                                <span>{row.title}</span>
                              </Tooltip>
                            )
                            : (
                              <span>
                                {row?.title || '--'}
                              </span>
                            )}
                        </Box>
                      </TableCell>
                      <TableCell>{row.sku || '--'}</TableCell>
                      <TableCell>{row.upc || '--'}</TableCell>
                      <TableCell>{row.asin || '--'}</TableCell>
                      <TableCell>{row.quantity || '--'}</TableCell>
                    </TableRow>
                  )) : (
                    !getMarketplaceInventoryLoading && totalMarketplaceInventory === 0 && (
                      <TableRow>
                        <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                          <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                            {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  )
              }
            </Table>
          )
          : null}

        <Pagination
          componentName="orders"
          position="relative"
          width="0"
          perPageRecord={marketplaceInventory?.length || 0}
          total={totalMarketplaceInventory}
          totalPages={Math.ceil(totalMarketplaceInventory / marketplaceInventoryPageLimit)}
          offset={totalMarketplaceInventory}
          pageNumber={marketplaceInventoryPageNumber}
          pageLimit={marketplaceInventoryPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />

        <UploadModal
          show={uploadFile}
          onClose={() => handleUploadInventorySheetClose()}
          accept=".xlsx, .csv"
          title="Drag & drop files or"
          supportedFormat="Support Format CSV or Xlsx File"
          handleChangeAttachment={handleChangeAttachment}
          attachmentName={attachmentName}
          attachmentLoading={attachmentLoading}
          handleSaveAttachment={handleSaveAttachment}
          disabled={attachmentLoading || !attachment}
          subTitle="Import Vendor Central Inventory Bulk Upload"
        />

        <UploadModal
          show={uploadMappingFile}
          onClose={() => handleUploadMappingSheetClose()}
          accept=".xlsx, .csv"
          title="Drag & drop files or"
          supportedFormat="Support Format CSV or Xlsx File"
          handleChangeAttachment={handleChangeMappingAttachment}
          attachmentName={attachmentName}
          attachmentLoading={attachmentLoading}
          handleSaveAttachment={handleSaveMappingAttachment}
          disabled={attachmentLoading || !attachment}
          subTitle="Import Mapping Bulk Upload"
        />
      </Box>
    </>
  );
};

export default Index;
