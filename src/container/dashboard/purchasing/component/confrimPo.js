import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack, Box, Grid, Divider, TableCell, TableRow, Menu, MenuItem, Fade
} from '@mui/material';
import {
  isEmpty
} from 'lodash';
import CryptoJS from 'crypto-js';
// icons
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Input from '../../../../components/inputs/input/index';
import LoaderWrapper from '../../../../components/loader/index';
import Pagination from '../../../../components/pagination/index';
import SearchInput from '../../../../components/searchInput/index';
import HoverImage from '../../../../components/imageTooltip';
import DeleteModal from './modals/delete';
import RecevingDetails from './recevingDetails';
import NonConfrimPO from './viewConfrimPo';
import AddPayment from './drawers/addPayment';
import Select from '../../../../components/select/index';
import noDataFound from '../../../../static/images/no-data-table.svg';
// images
import Product from '../../../../static/images/no-product-image.svg';
// constant
import {
  PO_STATUS, confrimPoHeader, REGEX_FOR_NUMBERS
} from '../../../../constants/index';
// redux
import {
  GetConfirmPONumbers,
  GetItemsOfConfirmPO,
  SetPurchaseOrderState,
  GetConfirmPOById,
  UpdatePOQueueItem,
  DownloadPurchaseOrderXlsxSheet,
  DownloadPurchaseOrderPdf
} from '../../../../redux/slices/purchasing';

import { PrintBarCode } from '../../../../../utils/helpers';

const ConfrimPo = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    confirmPONumbers,
    itemsOfConfirmPO,
    totalItemsOfConfirmPO,
    itemsOfConfirmPOPageLimit,
    itemsOfConfirmPOPageNumber,
    confirmPO,
    itemsOfPOLoading
  } = useSelector((state) => state.purchaseOrder);

  const {
    poQueueItemUpdated
  } = useSelector((state) => state.poQueueItem);
  const [isEdit, setIsEdit] = useState(false);
  const [editPo, setEditPo] = useState('');
  const [localPONumbers, setLocalPONumbers] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [localItemsOfPO, setLocalItemsOfPO] = useState([]);
  const [selected, setSelected] = useState('');
  const [addPayment, setAddPayment] = useState(false);
  const [editInput, setEditInput] = useState(false);
  const [recevingDetails, setRecevingDetails] = useState('confrimPo');
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleExportAs = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [editItemHelperText, setEditItemHelperText] = useState({
    receivedQuantity: ''
  });
  const packNumber = ['14252', '86258', '29117', '90041', '57233'];
  function createData(
    product,
    partNo,
    supplier,
    cost,
    price,
    total,
    stock,
    action
  ) {
    return {
      product,
      partNo,
      supplier,
      cost,
      price,
      total,
      stock,
      action
    };
  }

  const data = [];
  for (let i = 0; i <= 10; i += 1) {
    data.push(
      createData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img
              width={40}
              height={40}
              src={Product}
              alt=""
            />
          </HoverImage>
          <Box>
            <Box
              component="span"
              className="product-name-clamp"
              whiteSpace="normal"
            >
              Rapido Boutique Collection
              Flipper Open Heel Adjustable Fin - LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>194773048809</Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>RQFA68-PR-S/M</Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        'FA68-ATL-FA683492',
        '500 ',
        '0',
        '0',
        '20',
        <Input width="87px" value="8" marginBottom="0px" />,
        <Box display="flex" gap={2}>
          <Box className={`icon-${editInput ? 'Save color-primary' : 'edit'} pointer`} onClick={() => setEditInput(!editInput)} />
          <Box
            className="icon-print pointer "
            onClick={() => PrintBarCode({ value: '194773048809', title: 'upc', format: 'upc' })}
          />
        </Box>
      )
    );
  }

  const getPONumbers = () => {
    dispatch(GetConfirmPONumbers({
      poStatus: PO_STATUS.confirm
    }));
  };

  const getItemsOfConfirmPO = ({ poStatus, purchaseOrderId }) => {
    const skip = (itemsOfConfirmPOPageNumber - 1) * itemsOfConfirmPOPageLimit;
    const limit = itemsOfConfirmPOPageLimit;
    dispatch(GetItemsOfConfirmPO({
      skip,
      limit,
      poStatus,
      purchaseOrderId
    }));
  };

  const getConfirmPOById = ({ poId }) => {
    dispatch(GetConfirmPOById({ poId }));
  };

  const handleOnchange = () => {
    const errors = {};
    Object.keys(editPo).forEach((key) => {
      if (key === 'poQueueItem') {
        if (editPo?.poQueueItem?.receivedQuantity === '') {
          errors.receivedQuantity = ' ';
          errors._id = editPo?.poQueueItem?._id;
        } if (editPo?.poQueueItem?.receivedQuantity) {
          errors.receivedQuantity = '';
          errors._id = '';
        }
      }
    });
    setEditItemHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleEditItem = () => {
    if (!isEmpty(editPo)) {
      const errors = {};
      Object.keys(editPo)?.forEach((key) => {
        if ((key === 'poQueueItem') && editPo?.poQueueItem?.receivedQuantity === '') {
          errors[key] = ' ';
          errors._id = editPo?.poQueueItem._id;
        } else {
          errors[key] = '';
        }
      });
      setEditItemHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));

      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        const findItem = itemsOfConfirmPO?.find((item) => item?._id === editPo?._id);
        if (Number(findItem?.poQueueItem?.receivedQuantity)
          !== Number(editPo?.poQueueItem?.receivedQuantity)) {
          dispatch(UpdatePOQueueItem({
            poQueueItemId: editPo?.poQueueItem?._id,
            updateParams: {
              receivedQuantity: editPo?.poQueueItem?.receivedQuantity
            },
            poId: params?.poId
          }));
        }
      }
    }
  };

  const handlePageLimit = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'itemsOfConfirmPOPageNumber', value: 1
    }));
    dispatch(SetPurchaseOrderState({
      field: 'itemsOfConfirmPOPageLimit', value: e
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetPurchaseOrderState({
      field: 'itemsOfConfirmPOPageNumber', value: e
    }));
  };

  const downloadPOConfirm = (e) => {
    const { value } = e.target;
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));

    if (value === 'excel') {
      dispatch(DownloadPurchaseOrderXlsxSheet({
        userId: userIdData, pOId: '64817bb3fd99c7e68bb8fc59'
      }));
    } else {
      dispatch(DownloadPurchaseOrderPdf({
        userId: userIdData, pOId: '64817bb3fd99c7e68bb8fc59'
      }));
    }
  };

  useEffect(() => {
    getPONumbers();
  }, []);

  useEffect(() => {
    if (confirmPONumbers?.length) {
      setLocalPONumbers(confirmPONumbers);
      setSelected(confirmPONumbers[0]);
    } else {
      setSelected('');
      setLocalPONumbers([]);
      setLocalItemsOfPO([]);
    }
  }, [confirmPONumbers]);

  useEffect(() => {
    const findPO = localPONumbers?.find((item) => item?.poId === searchVal);
    if (!isEmpty(findPO)) {
      setSelected(findPO);
    }
  }, [searchVal]);

  useEffect(() => {
    if (!isEmpty(selected)) {
      const filterPO = localPONumbers?.filter((item) => item?._id !== selected?._id);
      const findPO = localPONumbers?.find((item) => item?._id === selected?._id);
      const temp = [findPO];
      const concatPO = temp.concat(filterPO);
      setLocalPONumbers(concatPO);
    }
  }, [selected]);

  useEffect(() => {
    setEditItemHelperText({
      receivedQuantity: ''
    });
    if (!isEmpty(selected)) {
      getItemsOfConfirmPO({
        purchaseOrderId: selected?._id, poStatus: PO_STATUS.confirm
      });
      if (selected?._id) {
        getConfirmPOById({ poId: selected?._id });
      }
    }
  }, [selected, poQueueItemUpdated]);

  useEffect(() => {
    setEditItemHelperText({
      receivedQuantity: ''
    });
    if (!isEmpty(selected)) {
      getItemsOfConfirmPO({
        purchaseOrderId: selected?._id, poStatus: PO_STATUS.confirm
      });
    }
  }, [itemsOfConfirmPOPageLimit,
    itemsOfConfirmPOPageNumber]);

  useEffect(() => {
    if (!isEmpty(selected)) {
      if (totalItemsOfConfirmPO
        < (itemsOfConfirmPOPageLimit * itemsOfConfirmPOPageNumber)) {
        if (itemsOfConfirmPOPageNumber > 1) {
          dispatch(SetPurchaseOrderState({
            field: 'itemsOfConfirmPOPageNumber', value: itemsOfConfirmPOPageNumber - 1
          }));
        }
      }
      getItemsOfConfirmPO({
        purchaseOrderId: selected?._id, poStatus: PO_STATUS.confirm
      });
    }
  }, [totalItemsOfConfirmPO]);

  useEffect(() => {
    if (itemsOfConfirmPO?.length) {
      const addIsEdit = itemsOfConfirmPO?.map((item) => ({ ...item, isEdit: false }));
      setLocalItemsOfPO(addIsEdit);
    } else {
      setLocalItemsOfPO([]);
    }
  }, [itemsOfConfirmPO]);

  useEffect(() => {
    setEditItemHelperText({
      receivedQuantity: ''
    });
    if (!isEmpty(selected)) {
      getItemsOfConfirmPO({
        purchaseOrderId: selected?._id, poStatus: PO_STATUS.confirm
      });
    }
  }, [itemsOfConfirmPOPageLimit,
    itemsOfConfirmPOPageNumber]);

  useEffect(() => {
    if (!isEmpty(params?.poId)) {
      const ff = confirmPONumbers?.find((item) => item?.poId === params?.poId);
      setSelected(ff);
    }
  }, [confirmPONumbers]);

  return (
    <>
      {recevingDetails === 'confrimPo'
        ? (
          <>
            <Stack
              justifyContent="space-between"
              direction="row"
              pt={0.125}
            >
              <h2>Confirmed POs</h2>
              <Box display="flex" gap="16px" mt={-0.125}>
                <Box display="flex" mt={-0.625}>
                  <Box display="flex" alignItems="center" className="step-active">
                    <Box display="flex" alignItems="center">
                      {confirmPO?.poStatus !== PO_STATUS.inQueue
                        && confirmPO?.poStatus !== PO_STATUS.nonConfirm
                        ? (
                          <Box component="span" mr="6px" className="icon-checkCircle" fontSize={16}>
                            <span className="path1" />
                            <span className="path2" />
                          </Box>
                        )
                        : (
                          <CheckCircleOutlineOutlinedIcon
                            sx={{ fontSize: '16px', color: '#979797', marginRight: '6px' }}
                          />
                        )}
                      <Box
                        component="span"
                        fontWeight="600"
                        color="#272B41"
                      >
                        Confirmed

                      </Box>
                    </Box>
                    <Divider sx={{ width: '24px', marginRight: '12px', marginLeft: '10px' }} />
                  </Box>
                  <Box display="flex" alignItems="center" className="step-active">
                    <Box display="flex" alignItems="center">
                      {confirmPO?.poStatus === PO_STATUS.printed
                        ? (
                          <Box component="span" mr="6px" className="icon-checkCircle" fontSize={16}>
                            <span className="path1" />
                            <span className="path2" />
                          </Box>
                        )
                        : <CheckCircleOutlineOutlinedIcon sx={{ fontSize: '16px', color: '#979797', marginRight: '6px' }} />}
                      <Box component="span" fontWeight="600" color="#272B41">Printed</Box>
                    </Box>
                    <Divider sx={{ width: '24px', marginRight: '12px', marginLeft: '10px' }} />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center">
                      {confirmPO?.poStatus === PO_STATUS.received
                        ? (
                          <Box component="span" mr="6px" className="icon-checkCircle" fontSize={16}>
                            <span className="path1" />
                            <span className="path2" />
                          </Box>
                        )
                        : <CheckCircleOutlineOutlinedIcon sx={{ fontSize: '16px', color: '#979797', marginRight: '6px' }} />}
                      <Box component="span" fontWeight="600" color="#979797" mr={-0.125}>Received</Box>
                    </Box>
                  </Box>
                </Box>
                <SearchInput
                  autoComplete="off"
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                  }}
                  value={searchVal}
                  width="161px"
                  placeholder="Search by PO #"
                />
                <Button
                  text="Add Payment"
                  padding="4px 15px 4px 15px"
                  letterSpacing="0px"
                  startIcon={(
                    <AddCircleOutlineOutlinedIcon />
                  )}
                  onClick={() => {
                    setAddPayment(true);
                  }}
                />
                <Button
                  text="View All POs"
                  letterSpacing="0px"
                  padding="4px 14px 4px 16px"
                  startIcon={<RemoveRedEyeIcon sx={{ color: '#3C76FF' }} />}
                  onClick={() => {
                    navigate('/purchasing');
                  }}
                />
                <Button
                  text="Receiving Details"
                  letterSpacing="0px"
                  padding="4px 14px 4px 15px"
                  startIcon={<RemoveRedEyeIcon sx={{ color: '#3C76FF' }} />}
                  onClick={() => setRecevingDetails('viewDetails')}
                />
                <Button
                  onClick={handleExportAs}
                  startIcon={<span className="icon-export-icon" />}
                  className="icon-button"
                  tooltip="Export As"
                />
                <Menu
                  id="fade-menu"
                  className="menu-export-as"
                  MenuListProps={{
                    'aria-labelledby': 'fade-button'
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                >
                  <MenuItem sx={{ paddingTop: '8px', paddingBottom: '8px' }} onClick={handleClose}>PDF</MenuItem>
                  <MenuItem sx={{ paddingTop: '8px', paddingBottom: '8px' }} onClick={handleClose}>Excel</MenuItem>
                </Menu>
                <Button
                  onClick={() => PrintBarCode({ value: '12345678' })}
                  className="icon-button"
                  startIcon={<LocalPrintshopOutlinedIcon />}
                />

              </Box>
            </Stack>
            <Grid container columnSpacing={3} sx={{ marginTop: '19px' }}>
              <Grid item md={1}>
                <Box
                  sx={{ maxHeight: 'calc(100vh - 186px)', overflow: 'auto' }}
                  borderRight="1px solid #D9D9D9"
                >
                  {localPONumbers?.map((item) => (
                    <Box
                      className="pointer"
                      color={selected?.poId === item?.poId ? '#3C76FF' : '#5A5F7D'}
                      px={2.25}
                      key={item?._id}
                      onClick={() => setSelected(item)}
                    >
                      {item?.poId}
                      <Divider
                        sx={{ marginTop: '9px', marginRight: '10px', marginBottom: '16px' }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item md={11} borderLeft="1px solid #D9D9D9">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box
                    component="h3"
                    className="m-0"
                  >
                    <Box
                      component="span"
                      mr={0.625}
                    >
                      {' '}
                      PO Details:

                    </Box>
                    {selected?.poId}
                  </Box>
                </Box>
                <Box mt={14 / 8}>

                  <Table
                    fixed
                    tableHeader={confrimPoHeader}
                    height="238px"
                    bodyPadding="8px 12px"
                  >
                    {itemsOfPOLoading
                      ? <LoaderWrapper />
                      : localItemsOfPO?.length ? (
                        localItemsOfPO?.map((row) => (
                          <TableRow
                            hover
                            key={row._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell
                              component="th"
                              scope="row"
                              style={{ minWidth: 250, width: '22%' }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                              >
                                <img
                                  width={40}
                                  height={40}
                                  src={Product}
                                  alt=""
                                />
                                <Box>
                                  <Box
                                    component="span"
                                    className="product-name-clamp"
                                    whiteSpace="normal"
                                  >
                                    {row?.product?.title || '--'}
                                  </Box>
                                  <Stack
                                    spacing={1}
                                    direction="row"
                                    fontSize="10px"
                                  >
                                    <Box
                                      component="span"
                                      color="#979797"
                                    >
                                      UPC:
                                      <Box
                                        component="span"
                                        color="#5A5F7D"
                                        ml={0.3}
                                      >
                                        {row?.product?.primaryUpc || '--'}

                                      </Box>
                                    </Box>
                                    <Box
                                      component="span"
                                      color="#979797"
                                    >
                                      Stock Number:
                                      <Box
                                        component="span"
                                        color="#5A5F7D"
                                        ml={0.3}
                                      >
                                        {row?.product?.stockNumber || '--'}

                                      </Box>
                                    </Box>
                                  </Stack>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>{row?.product?.mfgPartNo || '--'}</TableCell>
                            <TableCell>{row?.orderedQuantity || 0}</TableCell>
                            <TableCell>{row?.poQueueItem?.receivedQuantity || 0}</TableCell>
                            <TableCell>{row?.backOrderQuantity || 0}</TableCell>
                            <TableCell>{row?.product?.quantityInStock || 0}</TableCell>
                            <TableCell>
                              <Input
                                autoComplete="off"
                                isError
                                name="receivedQuantity"
                                disabled={!row?.isEdit}
                                value={row?.isEdit
                                  ? editPo?.poQueueItem?.receivedQuantity
                                  : row?.poQueueItem?.receivedQuantity}
                                width="69px"
                                marginBottom="0px"
                                onChange={(e) => {
                                  if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                                    const { poQueueItem } = editPo;
                                    const objCopy = { ...poQueueItem };
                                    objCopy.receivedQuantity = e.target.value;
                                    editPo.poQueueItem = objCopy;
                                    setEditPo(editPo);
                                    handleOnchange();
                                  } else {
                                    e.target.value = editPo.poQueueItem.receivedQuantity;
                                  }
                                }}
                                helperText={editItemHelperText?._id === row?.poQueueItem?._id
                                  && editItemHelperText.receivedQuantity}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box display="flex" gap={2}>
                                <Box
                                  disabled={row?.isEdit}
                                  className={`icon-${row?.isEdit ? 'Save color-primary' : 'edit'} pointer`}
                                  onClick={() => {
                                    const findEdited = localItemsOfPO?.map((item) => item?.isEdit);
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
                                      setEditPo({ ...row });
                                    }
                                  }}
                                />
                                <Box className="icon-print pointer " />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        !itemsOfPOLoading && totalItemsOfConfirmPO === 0 && (
                          <TableRow>
                            <TableCell sx={{ borderBottom: '24px' }} colSpan={12} align="center">
                              <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                                {/* <img className="nodata-table-img" src={noDataFound} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </Table>

                  <Pagination
                    componentName="purchasing"
                    width="186px"
                    perPageRecord={itemsOfConfirmPO?.length || 0}
                    total={totalItemsOfConfirmPO}
                    totalPages={Math.ceil(totalItemsOfConfirmPO / itemsOfConfirmPOPageLimit)}
                    offset={totalItemsOfConfirmPO}
                    pageNumber={itemsOfConfirmPOPageNumber}
                    pageLimit={itemsOfConfirmPOPageLimit}
                    handlePageLimitChange={handlePageLimit}
                    handlePageNumberChange={handlePageNumber}
                  />
                </Box>
              </Grid>

            </Grid>
            <DeleteModal
              show={deleteProduct}
              lastTitle="Delete This PO!"
              onClose={() => setDeleteProduct(false)}
            />
          </>
        )
        : recevingDetails === 'viewDetails'
          ? (
            <RecevingDetails
              onClose={() => setRecevingDetails('confrimPo')}
            />
          )
          : (
            <NonConfrimPO
              onClose={() => setRecevingDetails('confrimPo')}
              onSelect={(e) => {
                setSelected(e);
              }}
            />
          )}
      {
        addPayment ? (
          <AddPayment
            pOId={confirmPO?._id}
            open={addPayment}
            onClose={() => setAddPayment(false)}
          />
        ) : null
      }
    </>
  );
};

export default ConfrimPo;
