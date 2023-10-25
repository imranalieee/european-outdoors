import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import moment from 'moment';
import {
  Stack, TableCell, TableRow, Box, Tooltip
} from '@mui/material';
// Components
import SearchInput from '../../../components/searchInput/index';
import Table from '../../../components/ag-grid-table/index';
import Pagination from '../../../components/pagination/index';
import LoaderWrapper from '../../../components/loader/index';

import {
  notificationHeader
} from '../../../constants/index';

import {
  GetNotifications,
  UpdateNotification
} from '../../../redux/slices/notification-slice';

const Index = () => {
  const dispatch = useDispatch();
  const {
    loading,
    allNotifications,
    totalNotifications
  } = useSelector((state) => state.notification);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [filters, setFilters] = useState({
    searchByKeywords: {
      keys: ['title'],
      value: ''
    }
  });
  const [searchByTitleValue, setSearchByTitleValue] = useState('');
  const [data, setData] = useState([]);
  const createData = (
    notificationId,
    title,
    description,
    date
  ) => ({
    notificationId,
    title,
    description,
    date
  });

  const handleSearchByTitle = debounce((value) => {
    setPageNumber(1);
    setFilters({
      ...filters,
      searchByKeywords: {
        ...filters.searchByKeywords,
        value
      }
    });
  }, 500);
  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const getNotifications = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetNotifications({
      skip,
      limit,
      filters,
      key: 'all'
    }));
  };

  const handleMarkAsRead = (notificationId, isRead) => {
    if (!isRead) {
      dispatch(UpdateNotification(notificationId));
    }
  };

  useEffect(() => {
    getNotifications();
  }, [filters, pageNumber, pageLimit]);

  useEffect(() => {
    const notificationsData = allNotifications?.map((notification) => {
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
      const notificationDetails = createData(
        `${notificationId}`,
        <Box>
          <Box component="span" className={markReadClass} onClick={() => handleMarkAsRead(notificationId, isRead)} />
          <Box component="span" className={notificationClass} ml={1.875} mr={0.5} />
          {title}
        </Box>,
        <Box className="product-name-clamp" component="span">
          {description.length > 60
            ? (
              <Tooltip
                placement="top-start"
                arrow
                title={description}
              >
                <span>
                  {description}
                </span>
              </Tooltip>
            )
            : (
              <span>
                {description}
              </span>
            )}
        </Box>,
        `${moment(createdAt).format('MMM, DD YYYY')}`
      );
      return notificationDetails;
    });
    setData(notificationsData);
  }, [allNotifications]);
  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <h2>Notifications</h2>
        <SearchInput
          autoComplete="off"
          width="204px"
          placeholder="Search by Title"
          value={searchByTitleValue}
          onChange={(e) => {
            setSearchByTitleValue(e.target.value);
            handleSearchByTitle(e.target.value);
          }}
        />
      </Stack>
      <Box mt={2.75}>
        {loading ? <LoaderWrapper /> : null}
        <Table tableHeader={notificationHeader} height="174px">
          {data?.map((row) => (
            <TableRow
              hover
              key={row.notificationId}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.date}</TableCell>
            </TableRow>
          ))}
        </Table>
        <Pagination
          componentName="notifications"
          total={totalNotifications}
          totalPages={Math.ceil(totalNotifications / pageLimit)}
          offset={totalNotifications}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </>
  );
};

export default Index;
