import React from 'react';
import { Tooltip } from '@mui/material';
import ButtonWrapper from './button.styled';

const Index = (props) => {
  const {
    variant,
    type,
    className,
    text,
    disabled,
    onClick,
    startIcon,
    width,
    height,
    borderRadius,
    style,
    id,
    endIcon,
    letterSpacing,
    padding,
    color,
    tooltip,
    textTransform,
    justifyContent
  } = props;
  return (
    <Tooltip {...props} classes={{ popper: 'custom-tooltip' }} arrow title={tooltip || ''}>
      <ButtonWrapper
        id={id}
        size="small"
        variant={variant}
        className={className}
        disabled={disabled}
        onClick={onClick}
        type={type}
        startIcon={startIcon}
        endIcon={endIcon}
        width={width}
        height={height}
        style={style}
        borderRadius={borderRadius}
        color={color}
        letterSpacing={letterSpacing}
        padding={padding}
        textTransform={textTransform}
        justifyContent={justifyContent}
      >
        {text}
      </ButtonWrapper>
    </Tooltip>
  );
};
export default Index;
