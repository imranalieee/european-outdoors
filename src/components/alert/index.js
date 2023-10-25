import React from 'react';

import AlertWrapper from './style';

const Index = (props) => {
  const {
    severity, icon, children, marginBottom, className
  } = props;

  return (
    <AlertWrapper
      className={className}
      icon={icon}
      severity={severity}
      marginBottom={marginBottom}
    >
      {children}
    </AlertWrapper>
  );
};

export default Index;
