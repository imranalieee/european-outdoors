import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  Avatar, Divider, Tooltip, MenuItem,
  Container, Menu, IconButton, Toolbar, Box, AppBar,
  Stack, Badge
} from '@mui/material';
// redux
import { LogOut } from '../../redux/slices/auth-slice';
import { SetUserState } from '../../redux/slices/user-slice';
import { GetNotifications, UpdateNotification } from '../../redux/slices/notification-slice';
// component
import Drawer from '../drawer/index';
import LoaderWrapper from '../loader/index';

import { GetS3ImageUrl } from '../../../utils/helpers';

// constant
import { userHeader } from '../../constants';

// images
import Logo from '../../static/images/logo.svg';
import UserImage from '../../static/images/user.svg';
// style
import HeaderWrapper from './style';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    userUpdated,
    loggedUser,
    tempUserProfile
  } = useSelector((state) => state.user);

  const {
    loading,
    drawerNotifications,
    unreadCount
  } = useSelector((state) => state.notification);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notificationModal, setNotificationModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [notificationsData, setNotificationsData] = useState([]);
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (e) => {
    if (e.target.innerText === 'Logout') {
      dispatch(LogOut());
    }
    setAnchorElUser(null);
  };

  const handleMarkAsRead = (notificationId, isRead) => {
    if (!isRead) {
      dispatch(UpdateNotification(notificationId));
    }
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  useEffect(() => {
    if (user.profileImage && user.profileImage !== '') {
      const url = GetS3ImageUrl({ bucketName: 'userProfile', key: user.profileImage });
      setImageUrl(url);
    }
  }, []);

  useEffect(() => {
    if (loggedUser && userUpdated) {
      setTimeout(() => {
        const url = GetS3ImageUrl({ bucketName: 'userProfile', key: loggedUser.profileImage });
        setImageUrl(url);
        dispatch(SetUserState({ field: 'userUpdated', value: false }));
        dispatch(SetUserState({ field: 'tempUserProfile', value: null }));
      }, 8000);
    }
  }, [loggedUser, userUpdated]);

  useEffect(() => {
    if (notificationModal) {
      dispatch(GetNotifications({ limit: 10, filters: { isRead: false }, key: 'drawer' }));
    }
  }, [notificationModal]);

  useEffect(() => {
    setNotificationsData(drawerNotifications);
  }, [drawerNotifications]);

  useEffect(() => {
    if (tempUserProfile) setImageUrl(tempUserProfile);
  }, [tempUserProfile]);

  return (
    <HeaderWrapper>
      <AppBar
        position="static"
        sx={{
          background: '#F8F8F8',
          padding: '0 10px',
          boxShahow: 'none'
        }}
      >
        <Container maxWidth={false} className="container-padding">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: 'space-between'
            }}
          >
            <img src={Logo} alt="no-logo" />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {userHeader.map((page, index) => {
                let pageIsHidden = (page.adminOnly) && user?.role !== 'admin';

                const {
                  viewProducts,
                  viewOrders,
                  viewPurchasing,
                  viewSuppliers
                } = user?.permissions || {};

                if (!viewProducts && page.title === 'Products') pageIsHidden = true;
                if (!viewOrders && page.title === 'Orders') pageIsHidden = true;
                if (!viewPurchasing && page.title === 'Purchasing') pageIsHidden = true;
                if (!viewSuppliers && page.title === 'Suppliers') pageIsHidden = true;

                return (
                  <NavLink
                    key={index}
                    to={page.to}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    style={{ display: pageIsHidden ? 'none' : '' }}
                  >
                    <MenuItem key={index}>
                      <div className="header-menu">
                        <Box component="span" width="16px" height="16px">
                          <span className={page.icon} />
                        </Box>
                        <span>{page.title}</span>
                      </div>
                    </MenuItem>
                  </NavLink>
                );
              })}
            </Box>

            <Box display="flex" className="header-button">
              {user?.status !== 'archived' && (
                <>
                  <MenuItem>
                    <IconButton
                      size="small"
                    >
                      <span className="icon-question" />
                    </IconButton>
                  </MenuItem>
                  <MenuItem>
                    <IconButton
                      size="small"
                      onClick={() => setNotificationModal(true)}
                    >
                      <Badge variant="dot">
                        <span className="icon-bell" />
                      </Badge>
                    </IconButton>
                  </MenuItem>
                </>
              )}
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ pr: 0 }}>
                  <Avatar
                    alt="Remy Sharp"
                    src={imageUrl || UserImage}
                    onError={(e) => handleImageError(e, UserImage)}
                    sx={{
                      width: 24,
                      height: 24
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                className="pt-0"
              >
                <Box px={2} pt={1}>
                  <Stack spacing={0.5} mb={2}>
                    <Box component="span" sx={{ fontSize: '10px', color: '#979797' }}>Logged As</Box>
                    <Box component="span" fontWeight="600" sx={{ fontSize: '11px', color: '#272B41' }}>{user?.name}</Box>
                    <Box component="span" sx={{ fontSize: '10px', color: '#272B41' }}>{user?.email}</Box>
                  </Stack>
                  {user?.status !== 'archived' && (
                    <>
                      <Divider />
                      <Box pt={1.625} pb={1.62}>
                        <Box
                          component="span"
                          className="pointer"
                          onClick={() => {
                            navigate('/user-management');
                            setAnchorElUser(null);
                          }}
                        >
                          <span className="icon-setting" />
                          <Box component="span" pl={0.75} sx={{ color: '#5A5F7D' }}>Settings</Box>
                        </Box>
                      </Box>
                    </>
                  )}
                  <Divider />
                  <Box py={1.5}>
                    <NavLink
                      onClick={(e) => handleCloseUserMenu(e)}
                    >
                      <span className="icon-logout" onClick={() => dispatch(LogOut())} />
                      <Box component="span" pl={0.75} sx={{ color: '#5A5F7D' }}>Logout</Box>
                    </NavLink>
                  </Box>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer open={notificationModal} width="472px" close={() => setNotificationModal(false)}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Box component="span" className="icon-left pointer" onClick={() => setNotificationModal(false)} />
            <h2 className="m-0 pl-2">Notifications</h2>
            {unreadCount > 0
              ? (
                <Box
                  component="span"
                  sx={{
                    background: '#3C76FF', color: '#fff', height: '20px', width: '20px'
                  }}
                  borderRadius="50px"
                  fontSize="10px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {unreadCount}
                </Box>
              )
              : null}
          </Stack>
          <Box sx={{ marginTop: '-2px' }}>
            <Box
              component="span"
              className="badge primary pointer"
              onClick={() => {
                setNotificationModal(false);
                navigate('/notifications');
              }}
            >
              See all

            </Box>
          </Box>
        </Stack>
        <Divider sx={{ margin: '24px 0 25px 0' }} />
        {loading && notificationModal ? <LoaderWrapper /> : null}
        {unreadCount > 0
          ? notificationsData?.map((notification) => {
            let notificationClass = 'status success';
            let markReadClass = 'icon-Vector sm-fontSize pointer';
            const {
              _id: notificationId,
              title,
              description,
              severity,
              isRead,
              createdAt
            } = notification;
            if (severity !== 'success') {
              if (severity === 'warn') {
                notificationClass = 'status warning';
              } else if (severity === 'info') {
                notificationClass = 'status info';
              } else if (severity === 'error') {
                notificationClass = 'status danger';
              }
            }
            if (isRead) {
              markReadClass += ' primary';
            }
            return (
              <Box key={notificationId}>
                <Stack direction="row">
                  <Box sx={{ marginTop: '9px' }}>
                    <Box component="span" className={markReadClass} onClick={() => handleMarkAsRead(notificationId, isRead)} />
                  </Box>
                  <Box display="flex" flexDirection="column" marginLeft={1.75}>
                    <Box display="flex" alignItems="center">
                      {' '}
                      <Box component="span" className={notificationClass} />
                      <Box component="span" sx={{ color: '#272B41' }} paddingLeft={0.5}>{title}</Box>
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        color: '#979797', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
                      }}
                      maxWidth="300px"
                      fontSize="10px"
                      pt={0.625}
                      pl={1.25}
                    >
                      {description}
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: '11px', color: '#5A5F7D' }}>
                    {moment(createdAt).format('MMM, DD YYYY')}
                  </Box>
                </Stack>
                <Divider sx={{ margin: '16px 0' }} />
              </Box>
            );
          })
          : (
            <span style={{ color: 'grey', textAlign: 'center' }}>
              No New Updates!
            </span>
          )}

      </Drawer>
    </HeaderWrapper>
  );
};

export default Header;
