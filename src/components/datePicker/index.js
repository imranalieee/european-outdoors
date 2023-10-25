import React from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { DatePicker } from '@mui/x-date-pickers';
import DatePickerWrapper from './style';

export default function BasicDatePicker({
  value, onChange, disablePast, disabled, disableHighlightToday, shouldDisableDate
}) {
  return (
    <DatePickerWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          disabled={disabled}
          value={value}
          shouldDisableDate={shouldDisableDate}
          disableHighlightToday={disableHighlightToday}
          disablePast={disablePast}
          components={{
            OpenPickerIcon: CalendarTodayOutlinedIcon
          }}
          onChange={onChange}
        />
      </LocalizationProvider>
    </DatePickerWrapper>
  );
}
