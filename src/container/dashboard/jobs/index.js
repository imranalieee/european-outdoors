import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, startCase } from 'lodash';
import moment from 'moment';
import {
  Stack, Box, TableCell, TableRow, Grid, List, ListItem, Menu, MenuItem
} from '@mui/material';
// component
import Button from '../../../components/button/index';
import LoaderWrapper from '../../../components/loader/index';
import Modal from '../../../components/modal/index';
import Pagination from '../../../components/pagination/index';
import SearchInput from '../../../components/searchInput/index';
import Select from '../../../components/select/index';
import Table from '../../../components/ag-grid-table/index';
import noData from '../../../static/images/no-data-table.svg';
import ProductHeaderWrapper from '../products/style';
// constant
import {
  selectState,
  selectAgendaType,
  jobsHeader,
  MarketplaceIdMapping
} from '../../../constants/index';

import {
  GetJobs,
  DeleteJob,
  RequeueJob,
  SetJobState
} from '../../../redux/slices/jobs-slice';

import { GetStores, SetStoreState } from '../../../redux/slices/store-slice';

// images
import Alert from '../../../static/images/alert.svg';

const Index = () => {
  const dispatch = useDispatch();

  const {
    loading,
    success,
    totalJobs,
    jobs,
    isJobDeleted
  } = useSelector((state) => state.jobs);

  const { stores } = useSelector((state) => state.store);

  const [deleteModal, setDeleteModal] = useState(false);

  const [storeTypes, setStoreTypes] = useState([{
    value: 'all',
    label: 'All'
  }]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [data, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [filters, setFilters] = useState({
    storeType: 'all',
    status: 'all',
    agendaType: 'sellerCentral',
    searchByKeywords: {
      keys: ['name'],
      value: ''
    }
  });

  const [selectedId, setSelectedId] = useState('');
  const open = Boolean(anchorEl);

  let modalOpen = false;

  const handleViewUserPermissionsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [searchByNameValue, setSearchByNameValue] = useState('');
  const [jobId, setJobId] = useState('');

  const handleChange = (value, key) => {
    setPageNumber(1);
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleSearchByJobName = debounce((value) => {
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

  const handleRequeueJob = (id) => {
    if (filters?.agendaType) {
      dispatch(RequeueJob({ jobId: id, agendaType: filters.agendaType }));
    }
  };

  const getJobs = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetJobs({ skip, limit, filters }));
  };

  const getStores = () => {
    dispatch(GetStores());
  };

  const createData = (
    id,
    store,
    job,
    attributes,
    jobProgress,
    status,
    next,
    lock,
    action
  ) => ({
    id,
    store,
    jobName: job,
    attributes,
    progress: jobProgress,
    status,
    next,
    lock,
    action
  });

  const handleDeleteJob = () => {
    if (filters?.agendaType) {
      dispatch(DeleteJob({ jobId, agendaType: filters.agendaType }));
    }
  };

  useEffect(() => {
    getJobs();
  }, [filters, pageNumber, pageLimit]);

  useEffect(() => {
    if (success) {
      setDeleteModal(false);
    }

    if (isJobDeleted && success) {
      if (jobs.length === 1) {
        if (pageNumber !== 1) setPageNumber(1);
        else getJobs();
      } else getJobs();
      dispatch(SetJobState({ field: 'isJobDeleted', value: false }));
    }
  }, [success, isJobDeleted]);

  useEffect(() => {
    getStores();

    return () => {
      dispatch(SetStoreState({ field: 'stores', value: [] }));
    };
  }, []);

  useEffect(() => {
    if (stores?.length) {
      setStoreTypes([
        ...storeTypes,
        ...stores
      ]);
    }
  }, [stores]);

  useEffect(() => {
    const jobsData = jobs?.map((job) => {
      let classValue = 'badge success';
      const {
        _id: id,
        storeName,
        name,
        progress,
        state,
        nextRunAt,
        lockedAt,
        data: jobAttributes
      } = job;

      const jobAttributesList = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const key in jobAttributes) {
        if (Object.prototype.hasOwnProperty.call(jobAttributes, key)) {
          if (key === 'storeId') {
            jobAttributesList.push(`${(key)}: ${storeName}`);
          } else if (key === 'marketplaceId') {
            jobAttributesList.push(`${(key)}: ${MarketplaceIdMapping[jobAttributes[key]]}`);
          } else {
            jobAttributesList.push(`${(key)}: ${jobAttributes[key]}`);
          }
        }
      }
      const jobStatus = selectState.find((status) => status.value === state);
      const { label } = jobStatus || {};

      if (label !== 'Completed') {
        if (label === 'Started') {
          classValue = 'badge started';
        } else if (label === 'InProgress' || label === 'Retry') {
          classValue = 'badge progress';
        } else if (label === 'Failed') {
          classValue = 'badge failed';
        }
      }
      const jobDetails = createData(
        `${id}`,
        `${storeName || '--'}`,
        `${name || '--'}`,
        jobAttributesList,
        `${progress || '--'}`,
        <span className={classValue}>{label || '--'}</span>,
        `${nextRunAt ? moment(nextRunAt).format('ddd, lll') : '--'}`,
        `${lockedAt ? moment(lockedAt).format('ddd, lll') : '--'}`,
        <Stack spacing={2} direction="row">
          <Box
            component="span"
            className="icon-reload pointer"
            onClick={() => handleRequeueJob(id)}
          />
          <Box
            component="span"
            className="icon-trash pointer"
            onClick={() => {
              setDeleteModal(true);
              setJobId(id);
            }}
          />
        </Stack>
      );
      return jobDetails;
    });

    setData(jobsData);
  }, [jobs]);

  const handleClose = () => {
    setTimeout(() => {
      if (!modalOpen) {
        setSelectedId(null);
        setAnchorEl(null);
      }
    }, 1000);
  };

  return (
    <>
      <ProductHeaderWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <h2>Jobs Management</h2>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
            <Select
              width={152}
              placeholder="Select Store"
              menuItem={storeTypes}
              value={filters.storeType}
              label="Store:"
              vertical
              handleChange={(e) => handleChange(e.target.value, 'storeType')}
            />
            <Select
              width={152}
              value={filters.agendaType}
              placeholder="Select Agenda Type"
              label="Type:"
              vertical
              menuItem={selectAgendaType}
              handleChange={(e) => handleChange(e.target.value, 'agendaType')}

            />
            <Select
              width={152}
              placeholder="Select State"
              menuItem={selectState}
              label="State:"
              vertical
              value={filters.status}
              handleChange={(e) => handleChange(e.target.value, 'status')}
            />
            <SearchInput
              autoComplete="off"
              placeholder="Search by Name"
              width="266px"
              value={searchByNameValue}
              onChange={(e) => {
                setSearchByNameValue(e.target.value);
              }}
            />

          </Box>
        </Box>
      </ProductHeaderWrapper>
      <Box mt={3.125}>
        <Table tableHeader={jobsHeader} height="171px">
          {loading && !deleteModal
            ? <LoaderWrapper />
            : data.length ? data.map((row) => (
              <TableRow
                hover
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.store}
                </TableCell>
                <TableCell>{row.jobName}</TableCell>
                <TableCell>
                  {row.attributes.length
                    ? (
                      <Box>
                        <Box
                          component="span"
                          className="cursor-pointer"
                          onMouseLeave={() => {
                            modalOpen = false;
                            handleClose();
                          }}
                          onMouseEnter={(e) => {
                            modalOpen = true;
                            setSelectedId(row.id);
                            handleViewUserPermissionsClick(e);
                          }}
                        >
                          {row.attributes[0]}
                        </Box>
                        {row.attributes.length > 1
                          ? (
                            selectedId && String(selectedId) === String(row.id)
                              ? (
                                <Menu
                                  anchorEl={anchorEl}
                                  id="account-menu"
                                  open={open}
                                  className="permission-menu"
                                  onClose={handleClose}
                                  style={{ pointerEvents: 'none' }}
                                  MenuListProps={{
                                    onMouseEnter: () => {
                                      modalOpen = true;
                                    },
                                    onMouseLeave: () => {
                                      modalOpen = false;
                                      handleClose();
                                    }
                                  }}
                                  PaperProps={{
                                    elevation: 0,
                                    sx: {
                                      overflow: 'visible',
                                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.05))',
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
                                  <div style={{ pointerEvents: 'auto' }}>
                                    {row.attributes?.map((list, index) => (
                                      index !== 0 ? (
                                        <MenuItem key={index}>
                                          {list}
                                        </MenuItem>
                                      ) : null
                                    ))}
                                  </div>
                                </Menu>
                              )
                              : null
                          )
                          : null}
                      </Box>
                    )
                    : '--'}
                </TableCell>
                <TableCell>{row.progress}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.next}</TableCell>
                <TableCell>{row.lock}</TableCell>
                <TableCell align="right">{row.action}</TableCell>
              </TableRow>
            )) : !loading && totalJobs === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 237px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )}

        </Table>
        <Pagination
          componentName="jobs"
          perPageRecord={jobs?.length || 0}
          total={totalJobs}
          totalPages={Math.ceil(totalJobs / pageLimit)}
          offset={totalJobs}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
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
                Are You Sure You Want To
              </h3>
              <h3 className="m-0">
                Delete The Item?
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              You won’t be able to revert it back.
            </Box>

          </Stack>
          <Stack spacing={3} pt={3} direction="row" justifyContent="end">
            <Button variant="text" text="Yes" onClick={handleDeleteJob} />
            <Button variant="outlined" text="No" className="btn-large" onClick={() => setDeleteModal(false)} />
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default Index;
