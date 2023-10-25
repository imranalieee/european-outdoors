import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import {
  Stack, Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import {
  isEmpty, cloneDeep, camelCase
} from 'lodash';
import { jsPDF as JsPDF } from 'jspdf';

import Table from '../../../../components/ag-grid-table';
import Pagination from '../../../../components/pagination';
// icons
import LoaderWrapper from '../../../../components/loader/index';
import HoverImage from '../../../../components/imageTooltip';
import Input from '../../../../components/inputs/input/index';
import BarcodeFile from '../../orders/component/print/barcodeFile';
// constants
import {
  REGEX_FOR_NUMBERS,
  confrimPoHeader,
  PO_STATUS,
  itemsOfReceivePOSort
} from '../../../../constants/index';
// helpers
import {
  GetS3ImageUrl
} from '../../../../../utils/helpers';
// images
import Product from '../../../../static/images/no-product-image.svg';
// redux
import {
  SetPurchaseOrderState,
  UpdatePOQueueItem,
  GetItemsOfPurchaseOrder,
  GetItemsOfSlip,
  UpdatePOSlipItem,
  UpdatePOWithoutNotification,
  SetPurchaseOrderNotifyState
} from '../../../../redux/slices/purchasing';

const ItemsOfPO = (props) => {
  const dispatch = useDispatch();

  const tableRef = useRef(null);
  const buttonRef = useRef(null);

  const { user: { permissions: { editPurchasing } } } = useSelector((state) => state.auth);
  const {
    itemsOfNonConfirmPOPageLimit,
    itemsOfNonConfirmPOPageNumber,
    itemsOfSlipPageNumber,
    itemsOfSlipPageLimit,
    itemsOfPO: POItems,
    purchaseOrder
  } = useSelector((state) => state.purchaseOrder);
  const {
    poId,
    itemsOfPO,
    totalItemsOfPO,
    selectedItem,
    isSlip,
    uniqueProductIds,
    loading,
    selectedSlip,
    slipItems
  } = props;

  const [localItemsOfPO, setLocalItemsOfPO] = useState([]);
  const [editPo, setEditPo] = useState('');
  const [editItemHelperText, setEditItemHelperText] = useState({
    receivedQuantity: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [print, setPrint] = useState(false);
  const [upc, setUpc] = useState('');

  const [sortValue, setSortValue] = useState({});

  const handleImageError = (event, image) => {
    event.target.src = image;
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
        const findItem = localItemsOfPO?.find((item) => item?._id === editPo?._id);
        if (Number(findItem?.poQueueItem?.receivedQuantity)
          !== Number(editPo?.poQueueItem?.receivedQuantity)) {
          if (!isEmpty(selectedSlip)) {
            dispatch(
              SetPurchaseOrderState({
                field: 'itemsOfSlipLoading',
                value: true
              })
            );
            dispatch(UpdatePOSlipItem({
              slipId: selectedSlip?._id,
              productId: editPo?.product?._id,
              updateParams: {
                receivedQuantity: Number(editPo?.poQueueItem?.receivedQuantity)
              }
            }));
          }

          dispatch(UpdatePOQueueItem({
            poQueueItemId: editPo?.poQueueItem?._id,
            updateParams: {
              receivedQuantity: Number(editPo?.poQueueItem?.receivedQuantity)
                - Number(findItem?.poQueueItem?.receivedQuantity)
            },
            poId
          }));
        } else {
          dispatch(
            SetPurchaseOrderNotifyState({
              message: 'Nothing updated !',
              type: 'info'
            })
          );
        }
      }
    }
  };

  const handlePageNumber = (e) => {
    if (isSlip) {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfSlipPageNumber',
          value: e
        })
      );
    } else {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfNonConfirmPOPageNumber',
          value: e
        })
      );
    }
  };

  const handlePageLimit = (e) => {
    if (isSlip) {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfSlipPageNumber',
          value: 1
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfSlipPageLimit',
          value: e
        })
      );
    } else {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfNonConfirmPOPageNumber',
          value: 1
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfNonConfirmPOPageLimit',
          value: e
        })
      );
    }
  };

  const getItemsOfPurchaseOrder = ({ poStatus, purchaseOrderId }) => {
    const skip = (itemsOfNonConfirmPOPageNumber - 1) * itemsOfNonConfirmPOPageLimit;
    const limit = itemsOfNonConfirmPOPageLimit;
    dispatch(
      GetItemsOfPurchaseOrder({
        skip,
        limit,
        poStatus,
        purchaseOrderId,
        sortBy: sortValue
      })
    );
  };

  const getItemsOfSlip = ({ poStatus, purchaseOrderId, productIds }) => {
    const skip = (itemsOfSlipPageNumber - 1) * itemsOfSlipPageLimit;
    const limit = itemsOfSlipPageLimit;
    dispatch(
      GetItemsOfSlip({
        skip,
        limit,
        poStatus,
        purchaseOrderId,
        productIds
      })
    );
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
    if (itemsOfPO?.length) {
      let addIsEdit = [];
      addIsEdit = itemsOfPO?.map((item) => ({ ...item, isEdit: false }));
      if (!isEmpty(selectedSlip) && slipItems?.length) {
        const itemsOfPOCopy = cloneDeep(itemsOfPO);
        addIsEdit = itemsOfPOCopy?.map((item) => {
          const findElement = slipItems?.find((obj) => obj?.productId === item?.product?._id);
          if (!isEmpty(findElement)) {
            const { poQueueItem } = item;
            const objCopy = { ...poQueueItem };
            objCopy.receivedQuantity = findElement.receivedQuantity;
            item.poQueueItem = objCopy;
          }
          return item;
        });
      }

      setLocalItemsOfPO(addIsEdit);
    } else {
      setLocalItemsOfPO([]);
    }
  }, [itemsOfPO]);

  useEffect(() => {
    if (!isEmpty(selectedItem)) {
      if (isSlip) {
        getItemsOfSlip({
          purchaseOrderId: selectedItem?._id,
          poStatus: PO_STATUS.confirm,
          productIds: uniqueProductIds
        });
      }
    }
  }, [itemsOfSlipPageLimit,
    itemsOfSlipPageNumber]);

  useEffect(() => {
    if (!isEmpty(selectedItem)) {
      getItemsOfPurchaseOrder({
        purchaseOrderId: selectedItem?._id,
        poStatus: PO_STATUS.confirm
      });
    }
  }, [itemsOfNonConfirmPOPageLimit,
    itemsOfNonConfirmPOPageNumber, sortValue]);

  useEffect(() => {
    if (POItems?.length) {
      const isAllCountSettled = [];
      POItems?.forEach((item) => {
        if (item?.poQueueItem?.poQuantity <= item?.poQueueItem?.receivedQuantity) {
          isAllCountSettled.push(true);
        } else {
          isAllCountSettled.push(false);
        }
      });
      const findNotSettled = isAllCountSettled?.includes(false);
      const isReceivingStart = POItems?.reduce((accumulator, object) => accumulator
        + Number(object?.poQueueItem?.receivedQuantity || 0), 0);
      if (!findNotSettled && purchaseOrder?.poStatus !== PO_STATUS.closed && purchaseOrder?._id) {
        dispatch(
          UpdatePOWithoutNotification({
            purchaseOrderId: purchaseOrder?._id,
            updateParams: { poStatus: PO_STATUS.closed }
          })
        );
      } else if (findNotSettled
        && isReceivingStart > 0
        && purchaseOrder?.poStatus !== PO_STATUS.received
        && purchaseOrder?._id) {
        dispatch(
          UpdatePOWithoutNotification({
            purchaseOrderId: purchaseOrder?._id,
            updateParams: { poStatus: PO_STATUS.received }
          })
        );
      }
    }
  }, [POItems]);

  useEffect(() => {
    if (upc && print) {
      buttonRef.current.click();
    }
  }, [print]);

  return (
    <Box mt={23 / 8} position="relative">
      <Table
        fixed
        tableHeader={confrimPoHeader}
        height="585px"
        bodyPadding="8px 12px"
        sortableHeader={itemsOfReceivePOSort}
        handleSort={handleSortChange}
        sortValue={sortValue}
      >
        {loading ? <LoaderWrapper />
          : localItemsOfPO?.length ? localItemsOfPO?.map((row) => (
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
                <Stack direction="row" spacing={1}>
                  {row?.product?.images?.primaryImageUrl
                    ? (
                      <HoverImage
                        image={GetS3ImageUrl({
                          bucketName: 'productImage',
                          key: row?.product?.images?.primaryImageUrl
                        })}
                        onError={(e) => handleImageError(e, Product)}
                      >
                        <img
                          width={40}
                          height={40}
                          onError={(e) => handleImageError(e, Product)}
                          src={GetS3ImageUrl({
                            bucketName: 'productImage',
                            key: row?.product?.images
                              ?.primaryImageUrl
                          })}
                          alt=""
                        />
                      </HoverImage>
                    ) : (
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
                      className="product-name-clamp"
                      whiteSpace="normal"
                    >
                      {row?.product?.title?.length > 30
                        ? (
                          <Tooltip
                            placement="top-start"
                            arrow
                            title={row?.product?.title}
                          >
                            <span>
                              {row?.product?.title || '--'}
                            </span>
                          </Tooltip>
                        ) : (
                          <span>
                            {row?.product?.title || '--'}
                          </span>
                        )}
                    </Box>
                    <Stack spacing={1} direction="row" fontSize="10px">
                      <Box component="span" color="#979797">
                        UPC:
                        <Box component="span" color="#5A5F7D" ml={0.3}>
                          {row?.product?.primaryUpc || '--'}
                        </Box>
                      </Box>
                      <Box component="span" color="#979797">
                        Stock Number:
                        <Box component="span" color="#5A5F7D" ml={0.3}>
                          {row?.product?.stockNumber || '--'}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{row?.product?.mfgPartNo || '--'}</TableCell>
              <TableCell>{row?.poQueueItem?.poQuantity || '--'}</TableCell>
              <TableCell>{row?.poQueueItem?.receivedQuantity || '--'}</TableCell>
              <TableCell>{row?.poQueueItem?.backOrderQuantity || '--'}</TableCell>
              <TableCell>{row?.product?.quantityInStock || '--'}</TableCell>
              <TableCell>
                { selectedSlip?.slipStatus === 'confirm'
                  ? row?.poQueueItem?.receivedQuantity
                  : (
                    <Input
                      autoComplete="off"
                      isError
                      name="receivedQuantity"
                      disabled={!row?.isEdit}
                      value={row?.isEdit
                        ? editPo?.poQueueItem?.receivedQuantity || ''
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
                  )}
              </TableCell>
              <TableCell align="right">
                <Box display="flex" gap={2}>
                  {isSlip && selectedSlip?.slipStatus !== 'confirm'
                    && (
                      <Box
                        disabled={row?.isEdit || !editPurchasing}
                        className={`icon-${row?.isEdit ? 'Save color-primary' : 'edit'} pointer`}
                        onClick={() => {
                          if (editPurchasing) {
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
                          }
                        }}
                      />
                    )}
                  {row?.product?.primaryUpc?.length === 11
                    || row?.product?.primaryUpc?.length === 12
                    ? (
                      <Box
                        className="icon-print pointer"
                        onClick={() => {
                          setUpc(row?.product?.primaryUpc);
                          setPrint(true);
                        }}
                      />
                    )
                    : (
                      <Box
                        className="icon-print disabled"
                      />
                    )}
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            !loading && totalItemsOfPO === 0 && (
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
        perPageRecord={itemsOfPO?.length || 0}
        total={totalItemsOfPO}
        totalPages={isSlip
          ? Math.ceil(
            totalItemsOfPO / itemsOfSlipPageLimit
          ) : Math.ceil(
            totalItemsOfPO / itemsOfNonConfirmPOPageLimit
          )}
        offset={totalItemsOfPO}
        pageNumber={isSlip ? itemsOfSlipPageNumber : itemsOfNonConfirmPOPageNumber}
        pageLimit={isSlip ? itemsOfSlipPageLimit : itemsOfNonConfirmPOPageLimit}
        handlePageLimitChange={handlePageLimit}
        handlePageNumberChange={handlePageNumber}
        position="relative"
        width="0px"
      />
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
    </Box>
  );
};

export default ItemsOfPO;
