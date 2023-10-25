import React, { useState } from 'react';
import {
  Stack, Box, Grid, Divider, TableCell, TableRow, Menu, MenuItem, Fade
} from '@mui/material';
// icons
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TotalAmountIcon from '../../../../static/images/total-icon.svg';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Input from '../../../../components/inputs/input/index';
import Switch from '../../../../components/switch/index';
import Pagination from '../../../../components/pagination/index';
import SearchInput from '../../../../components/searchInput/index';
import DeleteModal from './modals/delete';
import ViewPo from './viewConfrimPo';
import AddPayment from './drawers/addPayment';
import Modal from '../../../../components/modal/index';
import Select from '../../../../components/select/index';
import HoverImage from '../../../../components/imageTooltip';
// images
import Product from '../../../../static/images/no-product-image.svg';
// constant
import { confrimPoHeader, selectStatus, exportFile } from '../../../../constants/index';

const ConfrimPo = (props) => {
  const { onClose } = props;
  const [selected, setSelected] = useState('14252');
  const [addPayment, setAddPayment] = useState(false);
  const [confrimPo, setConfrimPo] = useState(false);
  const [addSlip, setAddSlip] = useState(false);
  const [editInput, setEditInput] = useState(false);
  const [edit, setEdit] = useState(false);
  const [recevingDetails, setRecevingDetails] = useState(false);
  const [supplierCodeList, setSupplierCodeList] = useState([{ value: 'all', label: 'All' }]);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleExportAs = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
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
              whiteSpace="normal"
              className="product-name-clamp"
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
          <Box className="icon-print pointer " />
        </Box>
      )
    );
  }

  return (
    <>
      {!confrimPo
        ? (
          <>
            <Stack justifyContent="space-between" direction="row" pt={0.125}>
              <Stack alignItems="center" direction="row" spacing={3} mt={-0.5}>
                <Box component="span" className="icon-left pointer" onClick={onClose} />
                <h2 className="m-0 pl-2">Receive PO</h2>
              </Stack>
              <Box display="flex" gap={17 / 8} mt={-0.125}>

                <Box display="flex">
                  <Box display="flex" alignItems="center" className="step-active">
                    <Box display="flex" alignItems="center">
                      <Box component="span" mr={10 / 8} className="icon-checkCircle" fontSize={16}>
                        <span className="path1" />
                        <span className="path2" />
                      </Box>
                      <Box component="span" fontWeight="600" color="#272B41">Confirmed</Box>
                    </Box>
                    <Divider sx={{ width: '24px', marginRight: '16px', marginLeft: '16px' }} />
                  </Box>
                  <Box display="flex" alignItems="center" className="step-active">
                    <Box display="flex" alignItems="center">
                      <Box component="span" mr={1} className="icon-checkCircle" fontSize={16}>
                        <span className="path1" />
                        <span className="path2" />
                      </Box>
                      <Box component="span" fontWeight="600" color="#272B41">Printed</Box>
                    </Box>
                    <Divider sx={{ width: '24px', marginRight: '16px', marginLeft: '16px' }} />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <CheckCircleOutlineOutlinedIcon sx={{ fontSize: '16px', color: '#979797', marginRight: '8px' }} />
                      <Box component="span" fontWeight="600" color="#979797" mr={-1}>Received</Box>
                    </Box>
                  </Box>
                </Box>
                <Box mt={0.25}>
                  <Switch
                    width="89px"
                    offText="Follow Up"
                    rightSpacing="28px"
                    leftSpacing="29px"
                    padding="4px 0"
                    onText="Follow Up"
                    translate="translateX(62px)"
                  />
                </Box>
                <SearchInput value="14252" width="198px" />
                <Button
                  text="View All POs"
                  letterSpacing="0px"
                  padding="4px 14px 4px 16px"
                  startIcon={<RemoveRedEyeIcon sx={{ color: '#3C76FF' }} />}
                  onClick={() => setConfrimPo(true)}
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
                {/* <Select exportButton border="none" value="" menuItem={exportFile} placeholder="Export" width="118px" /> */}
                <Button className="icon-button" startIcon={<LocalPrintshopOutlinedIcon />} />

              </Box>
            </Stack>

            <Grid container columnSpacing={3} sx={{ marginTop: '24px' }}>
              <Grid item md={1}>
                <Box sx={{ maxHeight: '351px', overflow: 'auto' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Box key={i} paddingLeft="13px" paddingRight="13px">
                      <Box display="flex" gap={53 / 8}>
                        <Box>
                          <Box compoent="span" fontSize="11px" color="#979797">Slip No.</Box>
                          <Box compoent="span" fontSize="13px" pt={0.625} display="block" color="#272B41" component="span">14252</Box>
                        </Box>
                      </Box>
                      <Divider sx={{ marginTop: '8px', marginRight: '24px', marginBottom: '16px' }} />
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item md={11} borderLeft="1px solid #D9D9D9">
                <Box display="flex" gap="89px" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box component="h3" className="m-0">
                      <Box component="span" mr={0.625}> PO Details:</Box>
                      {selected}
                    </Box>
                  </Box>
                  <Stack gap="93px" direction="row" marginLeft="-12px">
                    <Stack>
                      <Box component="span" fontSize="11px" color="#979797">Supplier code</Box>
                      <Box fontSize="13px" pt={0.5} color="#272B41" component="span">SCP</Box>
                    </Stack>
                    <Stack>
                      <Box component="span" fontSize="11px" color="#979797">PO Order time & date</Box>
                      <Box fontSize="13px" pt={0.5} color="#272B41" component="span">28 Dec 2022 • 9:55 AM</Box>
                    </Stack>
                    <Stack>
                      <Box component="span" fontSize="11px" color="#979797">Warehouse Instructions</Box>
                      <Box
                        fontSize="13px"
                        pt={0.5}
                        color="#272B41"
                        component="span"
                      >
                        Lorem Ipsum es simplemente el texto de relleno de las impre.

                      </Box>
                    </Stack>
                  </Stack>
                  <Box>
                    <Button
                      text="Add Slip"
                      letterSpacing="0px"
                      padding="4px 16px 4px 14px"
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => { setAddSlip(true); }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ marginTop: '24px', marginBottom: '25px' }} />
                <Box display="flex" justifyContent="space-between" mt={3} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box component="h3" className="m-0">
                      <Box component="span" mr={0.625}> Slip No:</Box>
                      502114
                    </Box>
                  </Box>
                  {!edit && (
                    <Button
                      text="Edit"
                      padding="4px 16px 4px 16px"
                      letterSpacing="0px"
                      startIcon={<span className="icon-edit" />}
                      onClick={() => {
                        setEdit(true);
                      }}
                    />
                  )}
                  {edit
                    && (
                      <Box display="flex" gap={2}>
                        <Button
                          text="Cancel"
                          startIcon={<CancelOutlinedIcon sx={{ color: '#3C76FF' }} />}
                          onClick={() => setEdit(false)}
                          padding="4px 17px 4px 15px"
                          letterSpacing="0px"
                        />
                        <Button
                          text="Save Changes"
                          letterSpacing="0px"
                          padding="4px 16px 4px 14px"
                          variant="contained"
                          startIcon={<span className="icon-Save" />}
                        />
                      </Box>
                    )}
                </Box>
                <Grid container columnSpacing={3} columns={11}>
                  <Grid item md={2}>
                    <Stack mb="15px">
                      <Box component="span" fontSize="11px" color="#979797">Added by User. Isaac</Box>
                      <Box fontSize="12px" pt={0.5} color="#272B41" component="span">28 Dec 2022 • 9:55 AM</Box>
                    </Stack>
                    <Stack mb="15px">
                      <Box component="span" fontSize="11px" color="#979797">Last Modified by User. Amanda</Box>
                      <Box fontSize="12px" pt={0.5} color="#272B41" component="span">28 Dec 2022 • 9:55 AM</Box>
                    </Stack>
                    <Stack>
                      <Box component="span" fontSize="11px" color="#979797">Received Date & Time</Box>
                      <Box fontSize="12px" pt={0.5} color="#272B41" component="span">28 Dec 2022 • 9:55 AM</Box>
                    </Stack>
                  </Grid>
                  <Grid item md={9}>
                    <Grid container columnSpacing={3} columns={9}>
                      <Grid item md={1.5}>
                        <Input label="Invoice Date" type="date" value="28 Dec 2022" width="100%" marginBottom="24px" />
                      </Grid>
                      <Grid item md={1.5}>
                        <Input label="Vendor Invoice No." value="#774857485" width="100%" marginBottom="24px" />
                      </Grid>
                      <Grid item md={1.5}>
                        <Input label="Invoice Amount" value="$0.00" width="100%" marginBottom="24px" />
                      </Grid>
                      <Grid item md={1.5}>
                        <Input label="Shipping Amount" value="$0.00" width="100%" marginBottom="24px" />
                      </Grid>
                      <Grid item md={1.5}>
                        <Input label="Tax" value="$0.00" width="100%" marginBottom="26px" />
                      </Grid>
                      <Grid item md={1.5}>
                        <Box display="flex" gap={1} sx={{ padding: '9px 8px', borderRadius: '4px', background: 'rgba(15, 182, 0, 0.05)' }}>
                          <Box>
                            <img src={TotalAmountIcon} alt="total amount icon" />
                          </Box>
                          <Stack>
                            <Box component="span" fontSize="10px" color="#979797">Total Invoice</Box>
                            <Box fontSize="13px" pt={0.5} fontWeight="600" color="#272B41" component="span">$102,222. 28</Box>
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid container columnSpacing={3} columns={9}>
                      <Grid item md={9}>
                        <Input label="Memo" value="Lorem Ipsum es simplemente el texto de relleno de las imprentas y archi." width="100%" marginBottom="0" />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
                <Box display="flex" justifyContent="center" gap={3} mr={115 / 8}>
                  <SearchInput className="recieving-scan" fontSize="16px" large placeholder="Scan Or Enter a UPC To Continue" height="40px" sx={{ width: '796px' }} width="796px" />
                  <Box sx={{ border: '1px solid #3C76FF' }} padding={2.25} borderRadius={1} className="pointer">
                    <span className="icon-scanner" />
                  </Box>
                </Box>
                {/* <Box display="flex" gap={3}>
                  <Input label="Added by User. Isaac" value="RPDFMSC-MT-L" width="312px" marginBottom="0" />
                  <Input label="Vendor Invoice No." value="#774857485" width="143px" marginBottom="0" />
                  <Input label="Shipping Amount" value="$0.00" width="143px" marginBottom="0" />
                  <Input label="Tax" value="$0.00" width="143px" marginBottom="0" />
                  <Input label="Invoice Amount" value="$0.00" width="145px" marginBottom="0" />
                </Box> */}
                {/* <Divider sx={{ marginTop: '24px', marginBottom: '25px' }} />
                <Box display="flex" gap={3}>
                  <Input label="Invoice Date" value="28 Dec 2022" width="312px" marginBottom="17px" />
                  <Stack>
                    <Box component="span" color="#979797" fontSize="11px">
                      Credit
                    </Box>
                    <Box pt={1.5} component="span" color="#272B41" fontSize="13px">
                      $0.00
                    </Box>
                  </Stack>
                  <Stack ml={52 / 8}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Different
                    </Box>
                    <Box pt={1.5} component="span" color="#272B41" fontSize="13px">
                      $0.00
                    </Box>
                  </Stack>
                  <Stack ml={43 / 8}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Amount
                    </Box>
                    <Box pt={1.5} component="span" color="#272B41" fontWeight="600" fontSize="13px">
                      $0.00
                    </Box>
                  </Stack>
                  <Box ml={19 / 8}>
                    <Input label="Updated by" value="$0.00" width="310px" marginBottom="0" />
                  </Box>
                </Box>
                <Box display="flex" gap={3}>
                  <Input label="Last Modified" type="date" value="28 Dec 2022" width="312px" marginBottom="0" />
                  <Input label="Memo" value="Lorem Ipsum es simplemente el texto de relleno de las imprentas y archi." width="647px" marginBottom="0" />
                </Box> */}
              </Grid>

            </Grid>

            <Box mt={23 / 8}>
              <Table fixed tableHeader={confrimPoHeader} height="585px" bodyPadding="8px 12px">
                {data.map((row) => (
                  <TableRow
                    hover
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={{ minWidth: 250, width: '22%' }}>
                      {row.product}
                    </TableCell>
                    <TableCell>{row.partNo}</TableCell>
                    <TableCell>{row.supplier}</TableCell>
                    <TableCell>{row.cost}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                ))}

              </Table>
              <Pagination
                total="133588"
                position="relative"
                width="0"
              />
            </Box>
            <DeleteModal show={deleteProduct} lastTitle="Delete This PO!" onClose={() => setDeleteProduct(false)} />
            <Modal show={addSlip} width={471} onClose={() => setAddSlip(false)}>
              <Box sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}>
                <CancelOutlinedIcon
                  className="pointer"
                  onClick={() => setAddSlip(false)}
                  sx={{
                    color: '#979797',
                    fontSize: 17,
                    position: 'absolute',
                    right: '24px',
                    top: '23px'
                  }}
                />
                <h2>Add Slip </h2>
                <Box mt={3}>
                  <Input label="Slip No." placeholder="Enter" width="100%" marginBottom="32px" />
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      text="Save"
                      variant="contained"
                      width="87px"
                      startIcon={<span className="icon-Save" />}
                      onClick={() => setAddSlip(false)}
                    />
                  </Box>
                </Box>
              </Box>
            </Modal>
          </>
        )
        : <ViewPo onClose={() => setConfrimPo(false)} />}
      <AddPayment open={addPayment} onClose={() => setAddPayment(false)} />
    </>
  );
};

export default ConfrimPo;
