import React, { useState, useEffect } from 'react';
import { isEmpty, startCase } from 'lodash';
import moment from 'moment';
import {
  Box, Stack, TableCell, TableRow, Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// components
import Modal from '../../../../../components/modal/index';
import LoaderWrapper from '../../../../../components/loader/index';
import Button from '../../../../../components/button/index';
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
// constant
import { openOpsHeader } from '../../../../../constants/index';
// images
import Alert from '../../../../../static/images/alert.svg';
import noData from '../../../../../static/images/no-data-table.svg';

import {
  GetOpenPurchaseOrders,
  CreateOpenPurchaseOrder,
  SetPurchaseOrderState
} from '../../../../../redux/slices/purchasing';

const PurchaseDrawer = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    openPurchaseOrders,
    queueQuantity,
    totalOpenPurchaseOrders,
    openPoCreated,
    createOpenPOloading,
    newlyAddedPoId
  } = useSelector((state) => state.purchaseOrder);

  const {
    open,
    onCloseModal,
    onClose,
    productId,
    supplierId,
    queueItem
  } = props;

  const [edit, setEdit] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState();
  const [poId, setPoId] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState();
  const [deleteModal, setDeleteModal] = useState(false);

  function createPosData(
    supplier,
    poQty,
    cost,
    action
  ) {
    return {
      supplier,
      poQty,
      cost,
      action
    };
  }
  const posData = [];
  for (let i = 0; i <= 5; i += 1) {
    posData.push(
      createPosData(
        '18746',
        'Aug 29, 2022 • 9:55 AM',
        '28 Dec 2022 ',
        <Box className="icon-left-arrow pointer" onClick={() => setEdit(true)} />
      )
    );
  }

  const getOpenPurchaseOrders = () => {
    dispatch(GetOpenPurchaseOrders({
      supplierId, productId
    }));
  };

  const handleCreateOpenPurchaseOrder = () => {
    const {
      poQuantity,
      unitCost
    } = queueQuantity;
    if (poQuantity && unitCost && productId) {
      dispatch(CreateOpenPurchaseOrder({
        isNewPO: true,
        item: {
          productId,
          supplierId,
          poQuantity,
          unitCost: Number(unitCost).toFixed(2)
        }
      }));
    }
  };

  const handleUpdatePurchaseOrder = () => {
    const {
      poQuantity,
      unitCost
    } = queueQuantity;
    if (purchaseOrderId) {
      dispatch(CreateOpenPurchaseOrder({
        item: {
          productId,
          supplierId,
          purchaseOrderId,
          poQuantity,
          unitCost: Number(unitCost).toFixed(2)
        }
      }));
    }
  };

  useEffect(() => {
    if (productId && supplierId) {
      getOpenPurchaseOrders();
    }
  }, [supplierId, productId, open]);

  useEffect(() => {
    if (openPurchaseOrders?.length) {
      setPurchaseOrders(openPurchaseOrders);
    } else {
      setPurchaseOrders([]);
    }
  }, [openPurchaseOrders]);

  useEffect(() => {
    if (!isEmpty(newlyAddedPoId)) {
      navigate(`/purchasing/non-confirm/${newlyAddedPoId}`);
      dispatch(SetPurchaseOrderState({
        field: 'newlyAddedPoId',
        value: ''
      }));
      dispatch(SetPurchaseOrderState({
        field: 'openPoCreated',
        value: false
      }));
    }
    if (!isEmpty(poId)) {
      navigate(`/purchasing/non-confirm/${poId}`);
    }
    setPoId('');
    onClose();
    onCloseModal();
    setDeleteModal(false);
    dispatch(SetPurchaseOrderState({
      field: 'queueQuantity',
      value: {
        unitCost: 0,
        poQuantity: 0
      }
    }));
  }, [openPoCreated]);

  return (
    <Drawer open={open} width="696px" close={onClose}>
      <Stack alignItems="center" direction="row" spacing={3}>
        {createOpenPOloading ? <LoaderWrapper /> : null}
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" alignItems="center">
            <Box component="span" className="icon-left pointer" onClick={onClose} />
            <h2 className="m-0 pl-2">SCP’s Open POs</h2>
          </Box>
          <Box>
            {!purchaseOrders?.length
              && (
                <Button
                  disabled={!queueQuantity?.unitCost || !queueQuantity.poQuantity}
                  className="pointer"
                  text="Create Open PO"
                  padding="4px 15px 4px 10px"
                  onClick={() => {
                    handleCreateOpenPurchaseOrder();
                  }}
                />
              )}

          </Box>
        </Box>

      </Stack>
      <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
      <Box>
        <Table tableHeader={openOpsHeader} height="400px" bodyPadding="13px 12px">
          {purchaseOrders?.length ? purchaseOrders?.map((row) => (
            <TableRow
              hover
              key={row?._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{row?.poId}</TableCell>
              <TableCell>
                {moment(new Date(row?.createdAt)).format('MMM DD, YYYY • hh:mm') || '--'}
              </TableCell>
              <TableCell>
                {moment(new Date(row?.createdAt)).format('DD MMM  YYYY') || '--'}
              </TableCell>
              <TableCell align="right">
                <Box
                  className="icon-left-arrow pointer"
                  onClick={() => {
                    setPoId(row?.poId);
                    setPurchaseOrderId(row?._id);
                    setDeleteModal(true);
                  }}
                />
              </TableCell>
            </TableRow>
          )) : !loading && (
            <TableRow>
              <TableCell sx={{ borderBottom: '24px' }} colSpan={12} align="center">
                <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                  {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                </Box>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </Box>

      <Modal show={deleteModal} width={362} onClose={() => setDeleteModal(false)}>
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '362px' }} className="reinvite-modal">
          {loading ? <LoaderWrapper /> : null}
          <Stack alignItems="center" justifyContent="center">
            <Box mt={0.875}>
              <img src={Alert} alt="no-logo" />
            </Box>
            <Box textAlign="center" sx={{ marginTop: '24px' }}>
              <h3 className="m-0">
                Are you Sure You Want To
              </h3>
              <h3 className="m-0">
                Move the quantity in selected purchase order?
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              You won’t be able to revert it back.
            </Box>

          </Stack>
          <Stack spacing={3} pt={3} direction="row" justifyContent="end">
            <Button variant="text" text="Yes" onClick={handleUpdatePurchaseOrder} />
            <Button variant="outlined" text="No" className="btn-large" onClick={() => setDeleteModal(false)} />
          </Stack>
        </Box>
      </Modal>
    </Drawer>
  );
};
export default PurchaseDrawer;
