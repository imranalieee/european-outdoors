import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
// components
import AppRoute from './routes/AppRoute';
import Notify from './components/notify';
// styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/icons/style.css';
import '../public/eo_favicon.png';
import GlobalStyles from './config/theme/global.styled';
import theme from './config/theme/themeVariables';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppRoute path="/" />
        <Notify />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
