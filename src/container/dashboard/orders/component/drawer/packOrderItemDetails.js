import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow, IconButton, Tooltip
} from '@mui/material';
import {
  difference, camelCase, lowerCase, startCase
} from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
// component
import Button from '../../../../../components/button/index';
import CheckBox from '../../../../../components/checkbox/index';
import Input from '../../../../../components/inputs/input/index';
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
import HoverImage from '../../../../../components/imageTooltip';
import LoaderWrapper from '../../../../../components/loader';

import AddItemToPack from './addItemToPack';
import DeleteModal from '../modals/delete';

import {
  GetOrderItemPackItems,
  SetOrderState,
  DeleteItemsFromPack,
  AddOrderItemsToPack
} from '../../../../../redux/slices/order/order-slice';
// Images
import Product from '../../../../../static/images/no-product-image.svg';
// constants
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
import {
  packDetailsSort, packDetailsHeader, REGEX_FOR_NUMBERS, BADGE_CLASS
} from '../../../../../constants/index';

const PackOrderItemDetails = ({ orderItemId, open, onClose }) => {
  const dispatch = useDispatch();

  const { user: { permissions: { editOrders } } } = useSelector((state) => state.auth);

  const [addItemToPack, setAddItemToPack] = useState(false);
  const [deleteItems, setDeleteItems] = useState([]);
  const [editPackItemsQuantity, setEditPackItemsQuantity] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [packItemIds, setPackItemsId] = useState([]);
  const [mode, setMode] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [packItems, setPackItems] = useState(false);
  const [sortValue, setSortValue] = useState({});

  const {
    getOrderItemPackItemLoading,
    deletePackItemLoading,
    orderItemPackDetail,
    addOrderPackItemLoading,
    totalCostOfPack,
    packDeleted,
    orderPackItemEdited
  } = useSelector((state) => state.order);

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

  const getOrderItemMatchProducts = () => {
    dispatch(GetOrderItemPackItems({ orderItemId, sortBy: sortValue }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handelEditPackDetails = () => {
    if (editPackItemsQuantity.length) {
      dispatch(AddOrderItemsToPack({ orderItemId, items: editPackItemsQuantity, action: 'editPackItems' }));
    }
  };

  const handlePackDetailClose = () => {
    setEditPackItemsQuantity([]);
    setDeleteItems([]);
    setHeaderCheckBox([]);
    dispatch(SetOrderState({ field: 'itemsForPack', value: [] }));
    onClose();
  };

  const handleSelectAllCheckBoxClicked = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setDeleteItems(packItemIds);
      setHeaderCheckBox(true);
    } else {
      setDeleteItems([]);
      setHeaderCheckBox(false);
    }
  };

  const handleConfirmDeleteItems = () => {
    if (deleteItems.length) {
      dispatch(DeleteItemsFromPack({
        packItemIds: deleteItems
      }));
    }
  };

  const handleCheckBoxClicked = (e, packId) => {
    if (e.target.checked) {
      setDeleteItems([
        ...deleteItems,
        packId
      ]);
    } else {
      const orderItemPackIds = deleteItems.filter((id) => id !== packId);
      setDeleteItems([...orderItemPackIds]);
    }
  };

  const handleEditPackQuantity = ({ row, action, value }) => {
    const { _id } = row;

    const packItemIndex = packItems.findIndex((packItemDoc) => (packItemDoc._id) === (_id));

    if (packItemIndex > -1) {
      const packItemsCopy = [...packItems];
      const updatedObject = { ...row };

      if (action === 'add') updatedObject.quantity += Number(value);
      if (action === 'remove') updatedObject.quantity -= Number(value);
      if (action === 'replace') {
        updatedObject.quantity = (Number(value) || 1);
      }
      packItemsCopy[packItemIndex] = updatedObject;

      const updateItem = editPackItemsQuantity.findIndex((item) => item._id === _id);

      const prevObject = orderItemPackDetail.find((packItemObj) => packItemObj._id === _id);

      if (prevObject) {
        const { quantity } = prevObject;

        if (quantity === updatedObject.quantity) {
          const editPackItemsQuantityCopy = editPackItemsQuantity
            .filter((editItem) => editItem._id !== _id);
          setEditPackItemsQuantity(editPackItemsQuantityCopy);
        } else if (updateItem > -1) {
          const updateItemCopy = { ...editPackItemsQuantity[updateItem] };

          updateItemCopy.quantity = updatedObject.quantity;

          editPackItemsQuantity[updateItem] = updateItemCopy;

          setEditPackItemsQuantity(editPackItemsQuantity);
        } else {
          setEditPackItemsQuantity([...editPackItemsQuantity, {
            _id, quantity: updatedObject.quantity
          }]);
        }
      }
      setPackItems(packItemsCopy);
    }
  };

  useEffect(() => {
    if (deleteItems.length && (difference(packItemIds, deleteItems)).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [deleteItems, packItemIds]);

  useEffect(() => {
    if (orderItemPackDetail?.length) {
      const packItemIdsList = [];

      const currentPack = orderItemPackDetail?.map((row) => {
        packItemIdsList.push(row._id);
        const editedItem = editPackItemsQuantity.find((item) => item._id === row._id);

        if (editedItem) {
          return {
            ...row,
            quantity: editedItem.quantity
          };
        }

        return row;
      });

      setPackItemsId(packItemIdsList);
      setPackItems(currentPack);
    } else {
      setPackItems([]);
    }
  }, [orderItemPackDetail]);

  useEffect(() => {
    getOrderItemMatchProducts();
  }, [orderItemId, sortValue]);

  useEffect(() => {
    if (orderPackItemEdited) {
      dispatch(SetOrderState({ field: 'orderPackItemEdited', value: false }));
      handlePackDetailClose();
    }
  }, [orderPackItemEdited]);

  useEffect(() => {
    if (!deletePackItemLoading) {
      setDeleteModal(false);
    }

    if (!deletePackItemLoading && packDeleted) {
      setMode('');
      setDeleteItems([]);
      getOrderItemMatchProducts();
    }
  }, [deletePackItemLoading]);

  useEffect(() => () => {
    dispatch(SetOrderState({ field: 'orderItemPackDetail', value: [] }));
  }, []);

  return (
    <Drawer
      open={open}
      width="1144px"
      close={onClose}
    >
      <Stack direction="row" justifyContent="space-between">
        {getOrderItemPackItemLoading ? <LoaderWrapper /> : null}
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={onClose}
          />
          <h2 className="m-0 pl-2">Pack Details</h2>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box component="span" color="#5A5F7D">
            Total Cost:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">
              $
              {' '}
              {Number(totalCostOfPack)?.toFixed(2)}
            </Box>
          </Box>
          <Button
            startIcon={<span className="icon-products" />}
            text="Add Items to Pack"
            onClick={() => setAddItemToPack(true)}
          />
          <Button
            startIcon={<span className="icon-trash" />}
            text="Remove Selected items"
            color="error"
            disabled={mode === '' ? deleteItems.length === 0 : true}
            onClick={() => setDeleteModal(true)}
          />
        </Stack>
      </Stack>
      <Box mt={3}>
        <Table
          tableHeader={packDetailsHeader}
          bodyPadding="8px 12px"
          checkbox
          isChecked={headerCheckBox}
          height="150px"
          onChange={(e) => handleSelectAllCheckBoxClicked(e)}
          sortableHeader={packDetailsSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          { addOrderPackItemLoading ? <LoaderWrapper /> : null}
          {packItems?.length ? packItems?.map((row) => (
            <TableRow
              hover
              key={row?._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Box component="span" display="flex" alignItems="center" gap={1.5}>
                  <CheckBox
                    marginBottom="0"
                    className="body-checkbox"
                    checked={deleteItems.includes(String(row._id)) && mode !== 'singleDelete'}
                    onChange={(e) => handleCheckBoxClicked(e, row._id)}
                  />
                  <Stack direction="row" spacing={1}>
                    {row.primaryImageUrl ? (
                      <HoverImage>
                        <img
                          width={40}
                          height={40}
                          onError={(e) => handleImageError(e, Product)}
                          src={GetS3ImageUrl({
                            bucketName: 'productImage', key: row.primaryImageUrl
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
                        sx={{ textOverflow: 'auto', whiteSpace: 'nowrap', overflow: 'auto' }}
                        maxWidth="200px"
                        className="product-name-clamp"
                      >
                        {row.title?.length > 30
                          ? (
                            <Tooltip
                              placement="top-start"
                              arrow
                              title={row.title}
                            >
                              <span>
                                {row.title }
                              </span>
                            </Tooltip>
                          )
                          : (
                            <span>
                              {row.title || '--'}
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
                          <Box component="span" color="#5A5F7D" ml={0.3}>{row.stockNumber || '--'}</Box>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </TableCell>
              <TableCell>{row.mfgPartNo}</TableCell>
              <TableCell>
                <Box
                  display="flex"
                  alignItems="center"
                >
                  <IconButton
                    className="p-0"
                    size="small"
                    onClick={() => {
                      handleEditPackQuantity({ row, action: 'add', value: 1 });
                    }}
                  >
                    <AddCircleOutlineOutlinedIcon color="primary" sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Box
                    my={-0.5}
                    mx={1}
                  >
                    <Input
                      autoComplete="off"
                      width="56px"
                      defaultValue={row.quantity}
                      value={row.quantity}
                      marginBottom="0"
                      isError={(row.quantity === '' || row.quantity === 0)}
                      helperText={(row.quantity === '' || row.quantity === 0) ? ' ' : ''}
                      onChange={(e) => {
                        if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                          handleEditPackQuantity({ row, action: 'replace', value: e.target.value });
                        } else {
                          e.target.value = '';
                        }
                      }}
                    />
                  </Box>
                  <IconButton
                    className="p-0"
                    size="small"
                    onClick={() => {
                      if (row?.quantity > 1) {
                        handleEditPackQuantity({ row, action: 'remove', value: 1 });
                      }
                    }}
                  >
                    <RemoveCircleOutlineOutlinedIcon color="primary" sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

              </TableCell>
              <TableCell>{row.quantityInStock || '--'}</TableCell>
              <TableCell>{`$${Number(row.costPrice || 0)?.toFixed(2)}`}</TableCell>
              <TableCell>
                <Box className={BADGE_CLASS[camelCase(row.status)]}>
                  {row.status ? startCase(lowerCase(row.status)) : '--'}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box
                  className="pointer"
                  onClick={() => {
                    if (editOrders) {
                      setMode('singleDelete');
                      setDeleteItems([row._id]);
                      setDeleteModal(true);
                    }
                  }}
                >
                  <span className="icon-trash" />
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                <Box
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="300px"
                />
              </TableCell>
            </TableRow>
          )}
        </Table>
        <Box textAlign="right" pt={2}>
          <Button
            startIcon={<span className=" icon-Save" />}
            text="Save Changes"
            variant="contained"
            disabled={editPackItemsQuantity.length === 0}
            onClick={() => handelEditPackDetails()}
          />
        </Box>
      </Box>

      {
        addItemToPack
          ? (
            <AddItemToPack
              isOpen={addItemToPack}
              onClose={() => setAddItemToPack(false)}
              orderItemId={orderItemId}
            />
          ) : null
      }

      { deleteModal
        ? (
          <DeleteModal
            loading={deletePackItemLoading}
            show={deleteModal}
            onClose={() => setDeleteModal(false)}
            onDelete={() => handleConfirmDeleteItems()}
          />
        )
        : null}
    </Drawer>
  );
};

export default PackOrderItemDetails;
