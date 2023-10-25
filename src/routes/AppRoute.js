import React, { useEffect } from 'react';
import {
  Route, Routes, Navigate, useLocation, useNavigate
} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// components
import Layout from '../layout';
import EmailSend from '../container/auth/component/email-sent-successfully';
import ForgetPassword from '../container/auth/component/forget-password';
import PasswordChanges from '../container/auth/component/password-changed-successfully';
import ResetPassword from '../container/auth/component/reset-password';
import SignIn from '../container/auth/component/sign-in';
import Product from '../container/dashboard/products';
import Supplier from '../container/dashboard/supplier';
import SupplierOrder from '../container/dashboard/supplier/supplierDetails';
import Users from '../container/dashboard/users';
import Jobs from '../container/dashboard/jobs';
import UserManagement from '../container/dashboard/userMangement';
import AddProduct from '../container/dashboard/products/component/addProduct';
import ViewProduct from '../container/dashboard/products/component/viewProduct';
import Notification from '../container/dashboard/notifications';
import InviteUser from '../container/auth/component/invite-user';
import { setAuthToken } from '../config/axios-configuration';
import PageNotFound from '../container/dashboard/page-not-found';
import ArchivedUserPage from '../container/dashboard/userMangement/archiveUser';
import Purchasing from '../container/dashboard/purchasing/component/addItem';
import PoQueue from '../container/dashboard/purchasing/component/poQueue';
import AllPo from '../container/dashboard/purchasing/component/allPo';
import NonConfrimPO from '../container/dashboard/purchasing/component/nonConfrimPo';
import ConfirmPO from '../container/dashboard/purchasing/component/receivePo';
import OrderManagement from '../container/dashboard/orders/component/orderMangement';
import PickSheet from '../container/dashboard/orders/component/pickSheet';
import NewOrder from '../container/dashboard/orders/component/newOrder';
import ProcessOrder from '../container/dashboard/orders/component/processOrder';
import ViewOrder from '../container/dashboard/orders/component/viewOrder';
import MarketplaceInventory from '../container/dashboard/marketplaceInventory';
import OrderWorkflow from '../container/dashboard/orders/component/orderWorkflow';
import BatchDetails from '../container/dashboard/orders/component/batchDetails';
import ProgressBar from '../components/progress';
import initializeSocket from '../../utils/socket';
import Alert from '../components/alert/index';

// redux
import {
  SetOtherState
} from '../redux/slices/other-slice';

const fontTheme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Inter',
      textTransform: 'none',
      fontSize: 30
    }
  }
});

const AppRoutes = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    token, allowedRoutes, defaultRoute, user
  } = useSelector((state) => state.auth);

  const {
    stockJobProgress
  } = useSelector((state) => state.other);

  setAuthToken(token);

  const handleNotification = (message) => {
    if (message?.notificationType === 'stock-updated') {
      if (Number(message?.progress)) {
        dispatch(SetOtherState({
          field: 'stockJobProgress',
          value: Number(message?.progress)
        }));
      }
    }
  };

  useEffect(() => {
    if ((!(location.pathname.includes('/orders/')) || !(location.pathname.includes('/products/'))) && stockJobProgress === 100) {
      dispatch(SetOtherState({
        field: 'stockJobProgress',
        value: undefined
      }));
    }
  }, [location, stockJobProgress]);

  useEffect(() => {
    const routePath = location.pathname;

    if (!token) {
      // navigate(routePath);
      return;
    }
    const socket = initializeSocket(token);
    socket.subscribeToNotifications(handleNotification);
    const dynamicRoutePattern = /(?:https?:\/\/([^\/?\s#]+))?\/([^\/?\s#]*)(?:[\?#].*)?/g; // regular expression to extract dynamic parameter value
    const dynamicRouteMatch = routePath.match(dynamicRoutePattern);

    const dynamicPath = dynamicRouteMatch[0];

    if (!allowedRoutes.includes(
      routePath && dynamicPath
    )) {
      if (user && user.status === 'archived') {
        navigate('/archived-user');
      } else {
        navigate('/not-found');
      }
    }
  }, [allowedRoutes]);

  return (
    <ThemeProvider theme={fontTheme}>
      {token ? (
        <Layout>
          {stockJobProgress !== undefined
            && (
              <Alert severity="info" marginBottom="26px" className="alert-progress">
                <Box component="p" fontWeight={600} fontSize="11px" lineHeight="14px" mb={1}>
                  Stock is Continue to being assign to the Order,
                  available to the backordered. Please wait........
                </Box>
                <ProgressBar value={stockJobProgress} />
              </Alert>
            )}
          <Routes>
            <Route path="/" element={<Navigate replace to={defaultRoute} />} />
            <Route exact path="/products" element={<Product />} />
            <Route exact path="/products/add-product" element={<AddProduct />} />
            <Route exact path="/products/:id" element={<ViewProduct />} />
            <Route exact path="/users" element={<Users />} />
            <Route exact path="/suppliers" element={<Supplier />} />
            <Route exact path="/jobs" element={<Jobs />} />
            <Route exact path="/orders/new-order" element={<NewOrder />} />
            <Route exact path="/orders/pick-sheet" element={<PickSheet />} />
            <Route exact path="/orders/process-orders" element={<ProcessOrder />} />
            <Route exact path="/orders/process-orders/:id" element={<OrderWorkflow />} />
            <Route exact path="/orders/pick-sheet/batch-detail" element={<BatchDetails />} />
            <Route exact path="/orders/:id" element={<ViewOrder />} />
            <Route exact path="/orders" element={<OrderManagement />} />
            <Route exact path="/purchasing" element={<Purchasing />} />
            <Route exact path="/purchasing/po-queue" element={<PoQueue />} />
            <Route exact path="/purchasing/all-po" element={<AllPo />} />
            <Route exact path="/purchasing/non-confirm/:poId" element={<NonConfrimPO />} />
            <Route exact path="/purchasing/confirm/:poId" element={<ConfirmPO />} />
            <Route exact path="/user-management" element={<UserManagement />} />
            <Route exact path="/notifications" element={<Notification />} />
            <Route exact path="/suppliers/:id" element={<SupplierOrder />} />
            <Route exact path="/archived-user" element={<ArchivedUserPage />} />
            <Route exact path="/marketplace-inventory" element={<MarketplaceInventory />} />
            <Route path="/not-found" element={<PageNotFound />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </Layout>
      )
        : (
          <Routes>
            <Route path="/" element={<Navigate replace to="/auth/sign-in" />} />
            <Route exact path="/auth/sign-in" element={<SignIn />} />
            <Route exact path="/auth/reset-password/:token" element={<ResetPassword />} />
            <Route exact path="/auth/reset-password" element={<ResetPassword />} />
            <Route exact path="/auth/forget-password" element={<ForgetPassword />} />
            <Route exact path="/auth/password-changed" element={<PasswordChanges />} />
            <Route exact path="/auth/email-send" element={<EmailSend />} />
            <Route exact path="/auth/invite-user" element={<InviteUser />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        )}
    </ThemeProvider>
  );
};

export default AppRoutes;
