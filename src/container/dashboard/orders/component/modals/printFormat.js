import React, {
  useState, useRef, useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReactToPrint from 'react-to-print';
import { isEmpty } from 'lodash';

import LoaderWrapper from '../../../../../components/loader';
import Modal from '../../../../../components/modal';
import Select from '../../../../../components/select';
import Button from '../../../../../components/button';
import Print from '../../../../../static/images/print-icon.svg';
import { pickOption } from '../../../../../constants';
import PrintableTable from '../print/printPickSheet';
import PrintableOrderSheets from '../print/printOrderSheets';
import PackingSlip from '../print/packingSlip';

import {
  GetPickSheetPrintableData,
  GetOrderInvoicePrintableData,
  SetOrderPickSheetState,
  GetPickSheetAndPackingSlipPrintableData
} from '../../../../../redux/slices/order/pick-sheet-slice';

const PrintDrawer = (props) => {
  const {
    batchId, show, onClose
  } = props;

  const tableRef = useRef();

  const dispatch = useDispatch();

  const {
    pdfDataLoading,
    pickSheetPrintableData,
    orderInvoicePrintableData
  } = useSelector((state) => state.orderPickSheet);

  const [printFormat, setPrintFormat] = useState(pickOption[0]?.value);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      if (printFormat === 'Pick Sheet') {
        dispatch(GetPickSheetPrintableData({ batchId }));
      } else if (printFormat === 'Packing Slip') {
        dispatch(GetOrderInvoicePrintableData({ batchId }));
      } else if (printFormat === 'Pick Sheet & Packing Slip') {
        dispatch(GetPickSheetAndPackingSlipPrintableData({ batchId }));
      }
    }
  }, [batchId, printFormat]);

  useEffect(() => {
    if (!isEmpty(pickSheetPrintableData)) {
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    }
  }, [pickSheetPrintableData]);

  useEffect(() => () => {
    dispatch(SetOrderPickSheetState({ field: 'pickSheetPrintableData', value: {} }));
    dispatch(SetOrderPickSheetState({ field: 'orderInvoicePrintableData', value: {} }));
  }, []);

  return (
    <div>
      <Modal show={show} width={471} onClose={onClose}>
        {pdfDataLoading || loading ? <LoaderWrapper /> : null}
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '471px' }} className="reinvite-modal">
          <CancelOutlinedIcon
            onClick={onClose}
            className="pointer"
            sx={{
              color: '#979797', fontSize: 17, position: 'absolute', right: '23px', top: '22px'
            }}
          />
          <Stack mb={4}>
            <Box mb={3}>
              <h2 className="m-0">
                Print Format
              </h2>
            </Box>
            <Select
              label="Print Format"
              menuItem={pickOption}
              placeholder="Select Option"
              width="100%"
              value={printFormat}
              handleChange={(e) => setPrintFormat(e.target.value)}
            />
          </Stack>
          <Box display="flex" justifyContent="flex-end" gap={3}>
            <Button variant="text" text="Cancel" onClick={onClose} />
            <ReactToPrint
              trigger={() => (
                <Button
                  variant="contained"
                  startIcon={(
                    <img
                      src={Print}
                      alt="no-icon"
                    />
                    )}
                  text="Print"
                />
              )}
              content={() => tableRef.current}
              onClick={() => onClose()}
            />

          </Box>
        </Box>
      </Modal>
      {
        printFormat === 'Pick Sheet' && !isEmpty(pickSheetPrintableData)
          ? (
            <PrintableTable data={pickSheetPrintableData} ref={tableRef} />
          ) : printFormat === 'Packing Slip' ? (
            <PackingSlip data={orderInvoicePrintableData} ref={tableRef} />
          ) : printFormat === 'Pick Sheet & Packing Slip' && !isEmpty(pickSheetPrintableData) ? (
            <PrintableOrderSheets
              orderInvoicePrintableData={orderInvoicePrintableData}
              pickSheetPrintableData={pickSheetPrintableData}
              tableRef={tableRef}
            />
          ) : null
      }

    </div>
  );
};

export default PrintDrawer;
