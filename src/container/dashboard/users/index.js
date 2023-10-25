/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  extend, debounce, keys, pickBy, camelCase, isEmpty, startCase
} from 'lodash';
import moment from 'moment';
import {
  Box, Stack, TableCell, TableRow, Menu, MenuItem, Grid, Divider, List, ListItem
} from '@mui/material';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
// component
import Select from '../../../components/select/index';
import Checkbox from '../../../components/checkbox/index';
import SearchInput from '../../../components/searchInput/index';
import Button from '../../../components/button/index';
import Drawer from '../../../components/drawer/index';
import Input from '../../../components/inputs/input/index';
import Table from '../../../components/ag-grid-table/index';
import Modal from '../../../components/modal/index';
import Pagination from '../../../components/pagination/index';
import LoaderWrapper from '../../../components/loader/index';
// constant
import {
  permissionsMenu,
  permission,
  tableHeader,
  tableHeaderArchived,
  selectStatus,
  sortTableHeader
} from '../../../constants/index';

import {
  GetUsers,
  ReInviteUser,
  InviteNewUser,
  ArchiveUser,
  UnarchiveUser,
  UpdateUserByAdmin,
  SetAdminNotifyState,
  SetAdminState
} from '../../../redux/slices/admin-slice';

import { ValidateEmail, CamelCaseToTitleCase, GetS3ImageUrl } from '../../../../utils/helpers';

// images
import Sent from '../../../static/images/sent.svg';
import UserImage from '../../../static/images/user.svg';
import Alert from '../../../static/images/alert.svg';
import noData from '../../../static/images/no-data-table.svg';
// styles
import UserWrapper from './style';
import ProductHeaderWrapper from '../products/style';

const Index = () => {
  const dispatch = useDispatch();

  const {
    success = false,
    loading,
    userDeleted,
    totalUsers,
    users = []
  } = useSelector((state) => state.admin);

  const [imageUrl, setImageUrl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEd, setAnchorEd] = useState(null);
  const [reinvite, setReinvite] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [addProfile, setAddProfile] = useState(false);
  const [archive, setArchive] = useState(false);
  const [status, setStatus] = React.useState('');

  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [filters, setFilters] = useState({
    status: 'all',
    searchByKeyWords: {
      keys: ['name', 'email'],
      value: ''
    }
  });
  const [data, setData] = useState([]);
  const [reinviteUser, setReinviteUser] = useState({
    userId: '',
    email: ''
  });
  const [invitationEmailAddress, setInvitationEmailAddress] = useState('');
  const [invitationUserName, setInvitationUserName] = useState('');
  const [archiveUser, setArchiveUser] = useState({
    userId: '',
    status
  });
  const [unarchiveUser, setUnarchiveUser] = useState(false);
  const [userIdForUnarchive, setUserIdForUnarchive] = useState('');
  const [updateUserDetails, setUpdateUserDetails] = useState({
    userId: '',
    permissions: {}
  });
  const [userPermissions, setUserPermissions] = useState([]);
  const [userDetailForProfile, setUserDetailForProfile] = useState({
    _id: '',
    name: '',
    email: '',
    permissions: '',
    status: '',
    createdAt: '',
    statusUpdatedAt: ''
  });
  const [selectedUserPermissions, setSelectedUserPermissions] = useState({});
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');
  const [helperEmailText, setHelperEmailText] = useState('');
  const [sortValue, setSortValue] = useState({});

  const open = Boolean(anchorEl);
  const openE = Boolean(anchorEd);

  const createData = (
    _id,
    name,
    email,
    permissions,
    statusValue,
    signUp,
    statusChange,
    action
  ) => {
    const row = {
      _id,
      name,
      email,
      signUp,
      statusChange,
      action,
      status: statusValue
    };

    if (status !== 'archived') {
      extend(row, { permissions });
    }

    return row;
  };

  const getUsers = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;

    dispatch(GetUsers({
      skip, limit, filters, sortBy: sortValue
    }));
  };

  const handleClearReinviteUser = () => {
    setReinvite(false);
    setReinviteUser({
      userId: '',
      email: ''
    });
  };

  const sendReinviteToUserEmail = () => {
    const {
      userId
    } = reinviteUser;
    if (userId && userId !== '') dispatch(ReInviteUser({ userId }));
  };

  const handleViewUserPermissionsClick = (event, permissionList) => {
    setAnchorEl(event.currentTarget);
    setUserPermissions(permissionList);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setUserPermissions([]);
  };

  const handleClickLock = (event, userId, permissions) => {
    setAnchorEd(event.currentTarget);
    setUpdateUserDetails((prevState) => ({
      ...prevState,
      userId
    }));

    setSelectedUserPermissions(permissions);
  };

  const handleCloseLock = () => {
    setAnchorEd(null);
    setUpdateUserDetails({
      userId: '',
      permissions: ''
    });
  };

  const handleClearProfileStates = () => {
    setSelectedUserPermissions({});
    setUpdateUserDetails({
      userId: '',
      permissions: {}
    });
    setAddProfile(false);
    setImageUrl('');
    setUserDetailForProfile({
      _id: '',
      name: '',
      email: '',
      permissions: '',
      status: '',
      createdAt: '',
      statusUpdatedAt: ''
    });
  };

  const saveProfileChanges = () => {
    const {
      userId,
      permissions
    } = updateUserDetails;

    const anyPermission = (
      Object.values(selectedUserPermissions).some((val) => val === true));

    if (anyPermission) {
      if (userId && userId !== '') {
        if (!isEmpty(permissions)) {
          if (permissions.editPurchasing || permissions.viewPurchasing) {
            permissions.viewSuppliers = true;
          }
          if (!permissions.viewSuppliers
            && (selectedUserPermissions?.viewPurchasing
              || selectedUserPermissions?.editPurchasing)) {
            permissions.viewSuppliers = true;
          }
          dispatch(UpdateUserByAdmin({ userId, paramsToUpdate: { permissions } }));
        } else {
          dispatch(SetAdminNotifyState({ message: 'Nothing updated!', type: 'info' }));
        }
      } else {
        dispatch(SetAdminNotifyState({ message: 'UserId is required to update user!', type: 'error' }));
      }
    } else {
      dispatch(SetAdminNotifyState({ message: 'At least one permission is required!', type: 'warn' }));
    }
  };

  const handleSaveLock = () => {
    setAnchorEd(null);
    saveProfileChanges();
  };

  const handleChange = (value, key) => {
    setPageNumber(1);
    setStatus(value);
    setPageNumber(1);
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleSearch = debounce((value, key) => {
    setPageNumber(1);
    setFilters({
      ...filters,
      searchByKeyWords: {
        ...filters.searchByKeyWords,
        [key]: value
      }
    });
  }, 500);

  const handleInviteUser = (value, key) => {
    if (key === 'newUserEmail') {
      const emailError = ValidateEmail({ email: value });
      if (emailError !== '') {
        setHelperEmailText('Please enter a valid email address');
      } else setHelperEmailText('');

      setInvitationEmailAddress(value);
    } else if (key === 'newUserName') {
      setInvitationUserName(value);
    }
  };

  const handleInviteUserModalClose = () => {
    setNewUser(false);
    setInvitationEmailAddress('');
    setInvitationUserName('');
    setHelperEmailText('');
  };

  const handleSendInvitationClick = () => {
    const emailError = ValidateEmail({ email: invitationEmailAddress });
    if (emailError !== '') {
      if (invitationEmailAddress === '') setHelperEmailText('Email is required!');
      else setHelperEmailText('Please enter a valid email address');
      return;
    }
    dispatch(InviteNewUser({ name: invitationUserName, email: invitationEmailAddress }));
  };

  const handleCloseArchiveAndUnarchiveUserModal = ({ key }) => {
    if (key === 'archive') {
      setArchiveUser({
        userId: '',
        status: ''
      });
      setArchive(false);
    } else if (key === 'unarchive') {
      setUnarchiveUser(false);
      setUserIdForUnarchive('');
    }
  };

  const handleArchiveUser = () => {
    if (archiveUser?.userId && archiveUser?.userId !== '') {
      dispatch(ArchiveUser({ userId: archiveUser.userId }));
    } else {
      dispatch(SetAdminNotifyState({ message: 'UserId required for archive action!' }));
    }
  };

  const handleUnarchiveUser = () => {
    if (userIdForUnarchive && userIdForUnarchive !== '') {
      dispatch(UnarchiveUser({ userId: userIdForUnarchive }));
    } else {
      dispatch(SetAdminNotifyState({ message: 'UserId required for unarchive action!' }));
    }
  };

  const handlePermissionsMenuClick = (value, key) => {
    let updatePermissionObj = updateUserDetails.permissions;

    if (key.startsWith('edit')) {
      if (value === true) {
        // add view permission of it also
        if (key === 'editOrders') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editOrders: true,
            viewOrders: true
          };
        } else if (key === 'editProducts') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editProducts: true,
            viewProducts: true
          };
        } else if (key === 'editPurchasing') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editPurchasing: true,
            viewPurchasing: true
          };
        } else if (key === 'editSuppliers') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editSuppliers: true,
            viewSuppliers: true
          };
        }
      } else {
        // just remove this permission means set false
        extend(updatePermissionObj, { [key]: value });
      }
    }
    if (key.startsWith('view')) {
      if (value === true) {
        // add view permission only set true
        extend(updatePermissionObj, { [key]: value });
      } else if (value === false) {
        // also take back it's edit permission
        if (key === 'viewOrders') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editOrders: false,
            viewOrders: false
          };
        } else if (key === 'viewProducts') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editProducts: false,
            viewProducts: false
          };
        } else if (key === 'viewPurchasing') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editPurchasing: false,
            viewPurchasing: false
          };
        } else if (key === 'viewSuppliers') {
          updatePermissionObj = {
            ...updatePermissionObj,
            editSuppliers: false,
            viewSuppliers: false
          };
        }
      }
    }

    const {
      userId
    } = updateUserDetails;

    setUpdateUserDetails({
      userId,
      permissions: updatePermissionObj
    });

    const result = {};
    for (const keyOfObj in selectedUserPermissions) {
      if (Object.prototype.hasOwnProperty.call(updatePermissionObj, keyOfObj)) {
        result[keyOfObj] = updatePermissionObj[keyOfObj];
      } else {
        result[keyOfObj] = selectedUserPermissions[keyOfObj];
      }
    }

    setSelectedUserPermissions(result);
  };

  const handleViewUserProfile = (user) => {
    setAddProfile(true);

    if (user.profileImage && user.profileImage !== '') {
      const url = GetS3ImageUrl({ bucketName: 'userProfile', key: user.profileImage });
      setImageUrl(url);
    }

    setUserDetailForProfile({ ...user });
    setUpdateUserDetails({
      userId: user?._id,
      permissions: {}
    });
    setSelectedUserPermissions(user.permissions);
  };

  const handleImageError = (event) => {
    event.target.src = UserImage;
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
    dispatch(SetAdminState({ field: 'selectedPagination', value: e }));
  };

  const handlePageNumber = (e) => {
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
    const userData = users?.map((user) => {
      const {
        _id,
        name,
        email,
        permissions,
        status: statusValue,
        createdAt,
        statusUpdatedAt
      } = user;
      const statusChange = statusUpdatedAt ? moment(statusUpdatedAt).format('LLL') : null;
      const signUp = createdAt ? moment(createdAt).format('LLL') : null;

      let permissionList = keys(pickBy(permissions));
      const permissionCount = permissionList.length;

      permissionList = CamelCaseToTitleCase(permissionList);

      let statusClassName = 'badge success';
      if (statusValue === 'invited') statusClassName = 'badge primary';
      if (statusValue === 'archived') statusClassName = 'badge archived';

      const userDetails = createData(
        _id,
        name || '--',
        email || '--',
        permissionCount > 2
          ? (
            <>
              {permissionList.slice(0, 2).toString()}
              <Box component="span" className="menu-button" onClick={(e) => handleViewUserPermissionsClick(e, permissionList.slice(2))}>
                +
                {' '}
                {permissionCount - 2}
              </Box>
            </>
          )
          : (permissionCount > 0 && permissionCount < 3)
            ? (
              <>
                {permissionList.slice(0, 2).toString()}
              </>
            )
            : '--',
        <span className={statusClassName}>{startCase(statusValue) || '--'}</span>,
        signUp || '--',
        statusChange || '--',
        <Stack spacing={2} direction="row" justifyContent="end" alignItems="center">
          {statusValue === 'invited'
            ? (
              <Button
                height="18px"
                width="89px"
                size="small"
                variant="outlined"
                text="Re-invite"
                className="btn-small"
                onClick={() => {
                  setReinvite(true);
                  setReinviteUser({ userId: _id, email });
                }}
              />
            )
            : ''}
          {statusValue !== 'archived'
            ? (
              <>
                <Box component="span" className="icon-archived pointer" onClick={() => { setArchive(true); setArchiveUser({ userId: _id, status: statusValue }); }} />
                <Box component="span" className="icon-lock pointer active" onClick={(e) => handleClickLock(e, _id, permissions)} />
                <Box
                  component="span"
                  className="icon-left-arrow pointer"
                  onClick={() => handleViewUserProfile(user)}
                />
              </>
            )
            : <Box component="span" className="icon-archive-up pointer" onClick={() => { setUnarchiveUser(true); setUserIdForUnarchive(_id); }} />}
        </Stack>
      );
      return userDetails;
    });
    setData(userData);
  }, [users]);

  useEffect(() => {
    getUsers();
  }, [pageNumber, pageLimit, filters, sortValue]);

  useEffect(() => {
    if (success) {
      handleClearReinviteUser();
      handleInviteUserModalClose();
      handleCloseArchiveAndUnarchiveUserModal({ key: 'archive' });
      handleCloseArchiveAndUnarchiveUserModal({ key: 'unarchive' });
      handleClearProfileStates();
    }

    if (success && userDeleted) {
      if (users.length === 1) {
        if (pageNumber !== 1) setPageNumber(1);
        else getUsers();
      } else getUsers();
      dispatch(SetAdminState({ field: 'userDeleted', value: false }));
    }
  }, [success, userDeleted]);

  return (
    <UserWrapper>
      <ProductHeaderWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <h2 className="mb-0">
            {status === 'registered'
              ? 'Registered Users' : status === 'invited'
                ? 'Invited Users' : status === 'invited'
                  ? 'Invited Users' : status === 'archived'
                    ? 'Archived Users' : 'User Management'}
          </h2>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
            <Select
              width={155}
              placeholder="Select"
              handleChange={(e) => handleChange(e.target.value, 'status')}
              menuItem={selectStatus}
              value={filters.status}
              vertical
              label="Status:"
            />
            <SearchInput
              autoComplete="off"
              placeholder="Search Name/Email"
              onChange={(e) => { setSearchByKeyWordsValue(e.target.value); handleSearch(e.target.value, 'value'); }}
              value={searchByKeyWordsValue}
              width="247px"
            />
            <Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                text=" Add New User"
                onClick={() => setNewUser(true)}
              />
            </Box>
          </Box>
        </Box>
      </ProductHeaderWrapper>
      <Box mt={3}>
        <Table
          tableHeader={status === 'archived' ? tableHeaderArchived : tableHeader}
          bodyPadding="14px 12px"
          height="173px"
          sortableHeader={sortTableHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >

          {(loading && !(addProfile) && !(newUser)
            && !(reinvite) && !(unarchiveUser)
            && !(archive)) ? <LoaderWrapper />
            : data.length
              ? data?.map((row) => (
                <TableRow
                  hover
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  {row?.permissions
                    ? <TableCell>{row.permissions}</TableCell>
                    : null}
                  {row?.status
                    ? <TableCell>{row.status}</TableCell>
                    : null}
                  <TableCell>{row.signUp}</TableCell>
                  <TableCell>{row.statusChange}</TableCell>
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              ))
              : !loading && totalUsers === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={13} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 260px)">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Dta" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
        </Table>
        <Pagination
          componentName="users"
          perPageRecord={users?.length || 0}
          total={totalUsers}
          totalPages={Math.ceil(totalUsers / pageLimit)}
          offset={totalUsers}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
      <Modal show={reinvite} width={362} onClose={handleClearReinviteUser}>
        {loading ? <LoaderWrapper /> : null}
        <Box
          sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}
          className="reinvite-modal"
        >
          <Stack alignItems="center" justifyContent="center">
            <h2>Re-invite</h2>
            <Box sx={{ marginTop: '26px' }}>
              <img src={Sent} alt="no-logo" />
            </Box>
            <CancelOutlinedIcon
              onClick={handleClearReinviteUser}
              className="pointer"
              sx={{
                color: '#979797', fontSize: 16, position: 'absolute', right: '23px', top: '23px'
              }}
            />
            <Box
              sx={{
                color: '#5A5F7D', fontSize: 13, marginTop: '28px', marginBottom: '26px'
              }}
              textAlign="center"
            >
              <Box>Should re-invite?</Box>
              {reinviteUser.email}
            </Box>

          </Stack>
          <Box display="flex" justifyContent="end">
            <Button
              variant="contained"
              text="Send"
              startIcon={<SendOutlinedIcon />}
              onClick={sendReinviteToUserEmail}
            />
          </Box>
        </Box>
      </Modal>
      <Modal
        show={archive || unarchiveUser}
        width={362}
        onClose={() => handleCloseArchiveAndUnarchiveUserModal({ key: archive ? 'archive' : 'unarchive' })}
      >
        {loading ? <LoaderWrapper /> : null}
        <Box sx={{ position: 'relative', padding: '40px 32px', minWidth: '362px' }} className="reinvite-modal">
          <Stack alignItems="center" justifyContent="center" sx={{ marginBottom: '33px' }}>
            <Box mb={3.75}>
              <img src={Alert} alt="no-logo" />
            </Box>
            <Box textAlign="center">
              <h3 className="m-0">
                Are You Sure You Want To
              </h3>
              <h3 className="m-0">
                {archive ? 'Archive This User?' : unarchiveUser ? 'Unarchive This User?' : ''}
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              {
                archiveUser.status === 'invited' ? 'Ohh.. You can’t revert it back.' : null
              }
            </Box>
          </Stack>
          <Stack spacing={3} direction="row" justifyContent="end">
            <Button variant="text" text="Yes" onClick={archive ? handleArchiveUser : handleUnarchiveUser} />
            <Button variant="outlined" text="No" className="btn-large" onClick={() => handleCloseArchiveAndUnarchiveUserModal({ key: archive ? 'archive' : 'unarchive' })} />
          </Stack>
        </Box>
      </Modal>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        className="permission-menu"
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {userPermissions?.map((list, i) => (
          <MenuItem key={i}>
            {list}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={anchorEd}
        id="account-menu"
        open={openE}
        className="permission-menu lock-menu"
        onClose={handleCloseLock}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Stack>
          {permissionsMenu.map((list, i) => (
            <MenuItem key={i}>
              <Checkbox
                label={list}
                defaultChecked={selectedUserPermissions[camelCase(list)]}
                checked={selectedUserPermissions[camelCase(list)]}
                marginBottom="0px"
                onClick={(e) => handlePermissionsMenuClick(e.target.checked, camelCase(list))}
              />
            </MenuItem>
          ))}
          <Box textAlign="right" pt={1.625} pl={3.5} pr={3.75} pb={0}>
            <Button variant="contained" width="87px" text="Save" onClick={handleSaveLock} startIcon={<span className="icon-Save" />} />
          </Box>
        </Stack>
      </Menu>
      <Modal show={newUser} width={362} onClose={handleInviteUserModalClose}>
        {loading ? <LoaderWrapper /> : null}
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}>
          <CancelOutlinedIcon
            onClick={handleInviteUserModalClose}
            className="pointer"
            sx={{
              color: '#979797', fontSize: 17, position: 'absolute', right: '24px', top: '22px'
            }}
          />
          <h2>Add User</h2>
          <span>Enter information to send user invitation</span>
          <Box mt={3.25}>
            <Input
              hiddenLabel
              placeholder="Name"
              size="medium"
              label="Name"
              width="100%"
              marginBottom="17px"
              value={invitationUserName}
              onChange={(e) => handleInviteUser(e.target.value, 'newUserName')}
            />
            <Input
              hiddenLabel
              placeholder="Enter email address"
              size="medium"
              label="Email address"
              width="100%"
              marginBottom="40px"
              helperText={helperEmailText}
              value={invitationEmailAddress}
              onChange={(e) => handleInviteUser(e.target.value, 'newUserEmail')}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                text="Send"
                onClick={handleSendInvitationClick}
                startIcon={<span className="icon-Vector-3" />}
              />
            </Box>
          </Box>
        </Box>
      </Modal>
      <Drawer open={addProfile} width="696px" close={handleClearProfileStates}>
        {loading ? <LoaderWrapper /> : null}
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={handleClearProfileStates} />
          <h2 className="m-0 pl-2">User Profile</h2>
        </Stack>
        <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Input
              hiddenLabel
              placeholder="Name"
              size="medium"
              label="Name"
              width="100%"
              marginBottom="33px"
              value={userDetailForProfile.name}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              hiddenLabel
              placeholder="Enter Email"
              size="medium"
              label="Email Address"
              width="100%"
              marginBottom="33px"
              value={userDetailForProfile.email}
              disabled
            />
          </Grid>
        </Grid>
        <Box>
          <Box component="h3" marginBottom={1.5}>Permissions</Box>
          <Grid container rowSpacing={1}>
            <Grid item xs={9} className="pt-0">
              <List className="drawer-list">
                {permission.map((list, index) => (
                  <ListItem disablePadding key={index}>
                    <Checkbox
                      label={list}
                      marginBottom="-2px"
                      defaultChecked={selectedUserPermissions[camelCase(list)]}
                      checked={selectedUserPermissions[camelCase(list)]}
                      onClick={(e) => handlePermissionsMenuClick(e.target.checked, camelCase(list))}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={3} className="pt-0">
              <Box sx={{ marginTop: '-24px', marginLeft: '35px' }}>
                <img src={imageUrl || UserImage} onError={handleImageError} alt="no-user" className="rounded-image" />
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box mt={3}>
          <Box component="h3" mb={1.75}>Status</Box>
          <Stack direction="row" sx={{ marginBottom: '24px' }}>
            <Box component="span" sx={{ marginTop: '2px' }} className={userDetailForProfile.status === 'registered' ? 'badge success' : 'badge primary'}>{startCase(userDetailForProfile.status)}</Box>
            <Box
              component="span"
              sx={{ marginTop: '5px', marginLeft: '44px' }}
              className="label-color"
            >
              {userDetailForProfile.statusUpdatedAt && userDetailForProfile.statusUpdatedAt !== ''
                ? moment(userDetailForProfile.statusUpdatedAt).format('LLL')
                : null}
            </Box>
          </Stack>
        </Box>
        <Box textAlign="right">
          <Button
            variant="contained"
            text="Save"
            onClick={saveProfileChanges}
            startIcon={<Box component="span" className="icon-Save" />}
          />
        </Box>
      </Drawer>
    </UserWrapper>
  );
};

export default Index;
