import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { InputBase, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// styles
import SearchWrapper from './style';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: '1px solid #0000003b',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 0,
    width: 'auto'
  }
}));

const SearchIconWrapper = styled('div')(() => ({
  padding: '0 5px',
  height: '100%',
  position: 'absolute',
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#2793E8',
  zIndex: 1

}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: '5px 28px 5px 0px',
    color: '#272B41',
    // vertical padding + font size from searchIcon
    paddingLeft: 12,
    transition: theme.transitions.create('width'),
    width: '100%',
    '&::placeholder': {
      textOverflow: 'ellipsis !important',
      color: '#979797',
      opacity: 1
    }
  }
}));

export default function SearchAppBar(props) {
  const {
    placeholder,
    value,
    onChange,
    defaultValue,
    sx,
    scanStyle,
    width,
    label,
    onClick,
    name,
    large,
    fontSize,
    height,
    className,
    onKeyDown,
    autoComplete
  } = props;

  return (
    <SearchWrapper
      sx={sx}
      scanStyle={scanStyle}
      height={height}
      large={large}
      className={className}
    >
      {label && <label>{label}</label>}
      <Search>
        <SearchIconWrapper>
          {large ? <Box px={11 / 8} component="span" className="icon-arrow-return-right" />
            : <SearchIcon sx={{ fontSize: 19, color: '#3C76FF' }} className="pointer" onClick={onClick} />}
        </SearchIconWrapper>
        <StyledInputBase
          autoComplete={autoComplete}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          inputProps={{ 'aria-label': 'search' }}
          value={value}
          onChange={onChange}
          sx={{ width: width || '100%', fontSize: fontSize || '13px' }}
          onKeyDown={onKeyDown}
        />
      </Search>
    </SearchWrapper>
  );
}
