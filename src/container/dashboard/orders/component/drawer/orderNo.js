import React, {
  useState, useEffect, forwardRef, useRef
} from 'react';
import {
  Box, Stack, Divider, TableRow, TableCell, Tooltip
} from '@mui/material';
import ReactToPrint from 'react-to-print';
import {
  isEmpty
} from 'lodash';
import { useSelector } from 'react-redux';
import Drawer from '../../../../../components/drawer';
import Input from '../../../../../components/inputs/input';
import Button from '../../../../../components/button';
import Table from '../../../../../components/ag-grid-table';
import HoverImage from '../../../../../components/imageTooltip';

import Usps from '../../../../../static/images/shipment.svg';
import Ups from '../../../../../static/images/ups.svg';
import Amazon from '../../../../../static/images/amazon.svg';
import Product from '../../../../../static/images/no-product-image.svg';
import BarcodeFile from '../print/barcodeFile';

import { GetS3ImageUrl } from '../../../../../../utils/helpers';

import { labelHeader } from '../../../../../constants';

const PrintableContent = forwardRef(({ imageUrl }, ref) => (
  <div ref={ref}>
    <img src={imageUrl} alt="Shipping Label" />
  </div>
));

const OrderNo = (props) => {
  const labelRef = useRef();
  const tableRef = useRef();
  const {
    onClose, open, openBox, customerDetail, orderNo, setOpenLogs
  } = props;
  const {
    boxItems
  } = useSelector((state) => state.processOrder);

  const [itemsInBox, setItemsInBox] = useState(null);
  const [shipmentImage, setShipmentImage] = useState(Product);
  const [labelKey, setLabelKey] = useState('');

  const handlePackImageError = (event, image) => {
    event.target.src = image;
  };

  function OrderedcreateData(
    product,
    quantity,
    date,
    action
  ) {
    return {
      product,
      quantity,
      date,
      action
    };
  }
  const orderedData = [];
  for (let i = 0; i <= 10; i += 1) {
    orderedData.push(
      OrderedcreateData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img
              width={32}
              height={32}
              src={Product}
              alt=""
            />
          </HoverImage>
          <Box>
            <Box
              component="span"
              sx={{
                textOverfow: 'auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              maxWidth="250px"
              display="block"
            >
              Rapido Boutique Collection Flipper Open Heel Adjustable Fin -
              LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  194773048809
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  RQFA68-PR-S/M
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        '2',
        'Aug 29 2022 15:58',
        <Box component="span" className="icon-remove-file pointer" />
      )
    );
  }

  useEffect(() => {
    const boxData = [];
    if (!isEmpty(openBox?._id)) {
      if (!isEmpty(openBox?.shippingCompany)) {
        if (openBox?.shippingCompany === 'UPS') {
          setShipmentImage(Ups);
        } else if (openBox?.shippingCompany === 'USPS') {
          setShipmentImage(Usps);
        } else if (openBox?.shippingCompany === 'Amazon') {
          setShipmentImage(Amazon);
        }
      } else {
        setShipmentImage(Product);
      }
      if (!isEmpty(openBox?.labelKey)) {
        setLabelKey(openBox?.labelKey);
      } else {
        setLabelKey('');
      }
      const items = boxItems?.filter((item) => item?.boxId === openBox?._id);
      items?.forEach((item) => {
        boxData?.push(
          OrderedcreateData(
            <Stack direction="row" spacing={1}>
              <Box sx={{ '&:hover': 'transform: scale(1.5)' }}>
                {item?.productId?.images?.primaryImageUrl
                  ? (
                    <HoverImage
                      image={GetS3ImageUrl({
                        bucketName: 'productImage', key: item?.productId?.images?.primaryImageUrl
                      })}
                      onError={(e) => handlePackImageError(e, Product)}
                    >
                      <img
                        width={32}
                        height={32}
                        alt=""
                        onError={(e) => handlePackImageError(e, Product)}
                        src={GetS3ImageUrl({
                          bucketName: 'productImage', key: item?.productId?.images?.primaryImageUrl
                        })}
                      />
                    </HoverImage>
                  ) : (
                    <img
                      width={32}
                      height={32}
                      alt=""
                      onError={(e) => handlePackImageError(e, Product)}
                      src={Product}
                    />
                  )}
              </Box>
              <Box>
                <Box
                  component="span"
                  sx={{
                    textOverfow: 'auto',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  maxWidth="250px"
                  display="block"
                >
                  {item?.productId?.title?.length > 30
                    ? (
                      <Tooltip
                        placement="top-start"
                        arrow
                        title={item?.productId?.title}
                      >
                        <span>
                          {item?.productId?.title || '--'}
                        </span>
                      </Tooltip>
                    )
                    : (
                      <span>
                        {item?.productId?.title || '--'}
                      </span>
                    )}
                </Box>
                <Stack spacing={1} direction="row" fontSize="10px">
                  <Box component="span" color="#979797">
                    UPC:
                    <Box component="span" color="#5A5F7D" ml={0.3}>
                      {item?.productId?.primaryUpc || '--'}
                    </Box>
                  </Box>
                  <Box component="span" color="#979797">
                    Stock Number:
                    <Box component="span" color="#5A5F7D" ml={0.3}>
                      {item?.productId?.stockNumber || '--'}
                    </Box>
                  </Box>
                </Stack>
                <div style={{ display: 'none' }}>
                  {item?.productId?.primaryUpc
                    && <BarcodeFile ref={tableRef} value={item?.productId?.primaryUpc} />}
                </div>
              </Box>
            </Stack>,
            item?.productQuantity || '--',
            '',
            item?.productId?.primaryUpc
              ? <ReactToPrint
                trigger={() => (
                  <Box component="span" className="icon-print pointer" />
                )}
                content={() => tableRef.current}
              />
              : '--'
          )
        );
      });
      if (boxData?.length) {
        setItemsInBox(boxData);
      } else {
        setItemsInBox([]);
      }
    }
  }, [openBox?._id]);

  return (
    <Drawer open={open} width="696px" close={onClose}>
      <Stack alignItems="center" direction="row" spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" alignItems="center">
            <Box component="span" className="icon-left pointer" onClick={onClose} />
            <h2 className="m-0 pl-2">
              Order No:
              {' '}
              {orderNo}
            </h2>
          </Box>
        </Box>
      </Stack>
      <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
      <Box display="flex" gap={7.5}>
        <Box maxWidth="275px">
          <h3>Ships From</h3>
          <Box color="#5A5F7D" mb={0.5} fontWeight={600}>European Outdoors</Box>
          <Box
            component="p"
            fontSize="12px"
            color="#5A5F7D"
            lineHeight="17px"
            marginBottom="0px"
          >
            2596 NY 17m, Goshen NY 10924, MA 01430 (845) 341-2080

          </Box>

        </Box>
        <Box maxWidth="275px">
          <h3>Ships To</h3>
          <Box color="#5A5F7D" mb={0.5} fontWeight={600}>
            {customerDetail?.customerName || '--'}
          </Box>
          <Box
            component="p"
            fontSize="12px"
            color="#5A5F7D"
            lineHeight="17px"
            marginBottom="0px"
          >
            {customerDetail?.shippingInfo?.streetAddress || '--'}
            {customerDetail?.shippingInfo?.streetAddress ? ',' : ''}
            {' '}
            {customerDetail?.shippingInfo?.country || '--'}
            {customerDetail?.shippingInfo?.country ? ',' : ''}
            {' '}
            {customerDetail?.shippingInfo?.zipCode || '--'}
            {'\n'}
            {customerDetail?.phoneNumber}

          </Box>

        </Box>
      </Box>
      <Divider sx={{ marginTop: '24px', marginBottom: '16px' }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="mb-0">Box Dimensions</h3>
      </Box>
      <Box display="flex" mt={1.375} justifyContent="space-between">
        <Input
          disabled
          name="lengthCount"
          width="104px"
          minValue={0}
          label="Length (Inches)"
          placeholder="0"
          value={openBox?.length || 0}
        />
        <Input
          disabled
          width="104px"
          label="Width (Inches)"
          placeholder="0"
          value={openBox?.width || 0}
        />
        <Input
          disabled
          width="104px"
          label="Height (Inches)"
          placeholder="0"
          value={openBox?.height || 0}
        />
        <Input
          disabled
          width="104px"
          label="Weight (lb)"
          labelWeight="600"
          placeholder="0"
          value={openBox?.weight || 0}
        />
      </Box>
      <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
      <Box>
        <h3>Shipment Carriers</h3>
        <Box display="flex" alignItems="center" justifyContent="space-between" padding="6px 18px 5px 15px">
          <img src={shipmentImage} alt="no-shipment" />
          <Box component="span" color="#5A5F7D">{openBox?.shipmentCarrier || '--'}</Box>
          <Box
            component="span"
            color="#272B41"
            fontSize="16px"
            fontWeight="700"
          >
            {openBox?.shippingAmount ? `$${openBox?.shippingAmount}` : '--'}
          </Box>
        </Box>
      </Box>
      <Divider sx={{ marginTop: '10px', marginBottom: '26px' }} />
      <Box>
        <h3>Products</h3>
        <Box mt={2}>
          <Table tableHeader={labelHeader} minheight="151px" height="554px" bodyPadding="12px 14px">
            {itemsInBox?.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.product}
                </TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell align="right">{row.action}</TableCell>
              </TableRow>
            ))}
          </Table>

        </Box>
        <Box textAlign="right" mt={2.25}>
          {openBox?.labelKey && (
            <ReactToPrint
              trigger={() => (
                <Button
                  id="labelPrint"
                  textTransform="none"
                  text="Press F3 to Print Shipping Label"
                  variant="contained"
                  startIcon={<span className="icon-print" />}
                  disabled={!labelKey}
                />
              )}
              content={() => labelRef.current}
            />
          )}
          <div style={{ display: 'none' }}>
            <PrintableContent ref={labelRef} imageUrl={GetS3ImageUrl({ bucketName: 'shipmentLabel', key: labelKey })} />
          </div>
        </Box>
      </Box>
    </Drawer>
  );
};

export default OrderNo;
