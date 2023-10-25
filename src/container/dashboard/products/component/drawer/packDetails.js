import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableCell, TableRow, IconButton, Tooltip
} from '@mui/material';
import { difference, camelCase } from 'lodash';
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
import DeleteModal from '../modals/delete';
import AddItemsForPack from './addItems';
import {
  GetPacksByProductId, DeleteItemsFromPack, AddItemsToPack, SetPackState
} from '../../../../../redux/slices/pack-slice';
// Images
import Product from '../../../../../static/images/no-product-image.svg';
// constants
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
import { packDetailsHeader, REGEX_FOR_NUMBERS, sortPackDetailsHeader } from '../../../../../constants/index';
import LoaderWrapper from '../../../../../components/loader/index';

const PackDetails = ({ productId, onOpen, onClose }) => {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.product);
  const { user: { permissions: { editProducts } } } = useSelector((state) => state.auth);

  const {
    packDetail,
    packDeleted,
    deletePackItemLoading,
    getPackDetailLoading,
    packItemsEdited,
    addPackItemLoading
  } = useSelector((state) => state.pack);

  const [totalCost, setTotalCost] = useState(0);
  const [packItems, setPackItems] = useState([]);
  const [deleteItems, setDeleteItems] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [packItemIds, setPackItemsId] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [mode, setMode] = useState('');
  const [addItemsModal, setAddItemModal] = useState(false);
  const [editPackItemsQuantity, setEditPackItemsQuantity] = useState([]);
  const [sortValue, setSortValue] = useState({});
  const [createdData, setCreatedData] = useState([]);

  const getPackDetail = () => {
    dispatch(GetPacksByProductId({ productId }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handlePackDetailClose = () => {
    setEditPackItemsQuantity([]);
    setDeleteItems([]);
    setHeaderCheckBox([]);
    dispatch(SetPackState({ field: 'packDetail', value: [] }));
    onClose();
  };

  const handelEditPackDetails = () => {
    if (editPackItemsQuantity.length) {
      dispatch(AddItemsToPack({ productId, items: editPackItemsQuantity, action: 'editPackItems' }));
    }
  };

  const handleCheckBoxClicked = (e, packId) => {
    if (e.target.checked) {
      setDeleteItems([
        ...deleteItems,
        packId
      ]);
    } else {
      const queueItemIdsList = deleteItems.filter((id) => id !== packId);
      setDeleteItems([...queueItemIdsList]);
    }
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

      const prevObject = packDetail.find((packItemObj) => packItemObj._id === _id);

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
      setPackItems(createdData);

      setSortValue((prevSortValue) => ({
        [sortKey]: newSortValue
      }));
      return;
    }

    setSortValue((prevSortValue) => ({
      [sortKey]: newSortValue
    }));

    let sortByValue = '';
    if (sortKey === 'quantityOrdered') sortByValue = 'quantity';

    const sortedData = packItems?.slice().sort((a, b) => {
      let compareValue;
      if (typeof a[sortByValue] === 'number' && typeof b[sortByValue] === 'number') {
        compareValue = a[sortByValue] - b[sortByValue];
      } else {
        compareValue = a[sortByValue]?.localeCompare(b[sortByValue], undefined, { numeric: true, sensitivity: 'base' });
      }

      return newSortValue === 'asc' ? compareValue : -compareValue;
    });
    setPackItems([...sortedData]);
  };

  useEffect(() => {
    if (!deletePackItemLoading) {
      setDeleteModal(false);
    }

    if (!deletePackItemLoading && packDeleted) {
      setMode('');
      setDeleteItems([]);
      getPackDetail();
    }
  }, [deletePackItemLoading]);

  useEffect(() => {
    if (packDetail?.length) {
      const packItemIdsList = [];

      const currentPack = packDetail?.map((pack) => {
        packItemIdsList.push(pack._id);
        const editedItem = editPackItemsQuantity.find((item) => item._id === pack._id);

        if (editedItem) {
          return {
            ...pack,
            quantity: editedItem.quantity
          };
        }

        return pack;
      });

      setPackItemsId(packItemIdsList);
      setPackItems(currentPack);
      setCreatedData(currentPack);
    } else {
      setPackItems([]);
      setCreatedData([]);
    }
  }, [packDetail]);

  useEffect(() => {
    if (packItems.length) {
      const alterPack = packItems?.map(
        (pack) => ({ ...pack.itemId, quantityInPack: pack.quantity })
      );

      const totalQuantity = alterPack
        ?.reduce(
          (accumulator, object) => accumulator + (object?.quantityInPack * object?.costPrice),
          0
        );

      setTotalCost(totalQuantity);
    } else {
      setTotalCost(0);
    }
  }, [packItems]);

  useEffect(() => {
    if (productId) getPackDetail();
  }, [productId]);

  useEffect(() => {
    if (deleteItems.length && difference(packItemIds, deleteItems).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [deleteItems, packItemIds]);

  useEffect(() => {
    if (packItemsEdited) {
      dispatch(SetPackState({ field: 'packItemsEdited', value: false }));
      handlePackDetailClose();
    }
  }, [packItemsEdited]);

  return (
    <>
      <Drawer
        open={onOpen}
        width="1144px"
        close={handlePackDetailClose}
      >
        {loading || addPackItemLoading ? <LoaderWrapper /> : null}
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handlePackDetailClose}
            />
            <h2 className="m-0 pl-2">Pack Details</h2>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box component="span" color="#5A5F7D">
              Total Cost:
              <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">
                $
                {Number(totalCost)?.toFixed(2) || 0}
              </Box>
            </Box>
            <Button
              disabled={!editProducts}
              startIcon={<span className="icon-products" />}
              text="Add Items to Pack"
              onClick={() => setAddItemModal(true)}
            />
            <Button
              startIcon={<span className="icon-trash" />}
              text="Remove Selected items"
              disabled={mode === '' ? deleteItems.length === 0 : true}
              onClick={() => setDeleteModal(true)}
              color="error"
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
            sortableHeader={sortPackDetailsHeader}
            handleSort={handleSortChange}
            sortValue={sortValue}
          >
            {getPackDetailLoading ? <LoaderWrapper /> : null}

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
                      {row.itemId?.images?.primaryImageUrl ? (
                        <HoverImage
                          image={GetS3ImageUrl({
                            bucketName: 'productImage', key: row.itemId?.images?.primaryImageUrl
                          })}
                          onError={(e) => handleImageError(e, Product)}
                        >
                          <img
                            width={40}
                            height={40}
                            onError={(e) => handleImageError(e, Product)}
                            src={GetS3ImageUrl({
                              bucketName: 'productImage', key: row.itemId?.images?.primaryImageUrl
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
                          {row.itemId?.title?.length > 30
                            ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row.itemId?.title}
                              >
                                <span>
                                  {row.itemId?.title}
                                </span>
                              </Tooltip>
                            )
                            : (
                              <span>
                                {row.itemId?.title || '--'}
                              </span>
                            )}
                        </Box>
                        <Stack spacing={1} direction="row" fontSize="10px">
                          <Box component="span" color="#979797">
                            UPC:
                            <Box component="span" color="#5A5F7D" ml={0.3}>{row.itemId?.primaryUpc || '--'}</Box>
                          </Box>
                          <Box component="span" color="#979797">
                            Stock Number:
                            <Box component="span" color="#5A5F7D" ml={0.3}>{row.itemId?.stockNumber || '--'}</Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell>{row.itemId?.mfgPartNo}</TableCell>
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
                <TableCell>{row.itemId?.quantityInStock || '--'}</TableCell>
                <TableCell>{`$${Number(row.itemId?.costPrice || 0)?.toFixed(2)}`}</TableCell>
                <TableCell align="right">
                  <Box
                    className="pointer"
                    onClick={() => {
                      if (editProducts) {
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
      </Drawer>

      {addItemsModal
        ? (
          <AddItemsForPack
            productId={productId}
            isOpen={addItemsModal}
            onClose={() => setAddItemModal(false)}
          />
        )
        : null}

      <DeleteModal
        loading={deletePackItemLoading}
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => handleConfirmDeleteItems()}
      />
    </>
  );
};

export default PackDetails;
