import { Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import * as React from 'react';

import ReactDOM from 'react-dom/client';
import Terminal from './components/Terminal';

const theme = createTheme({
  typography: {
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    overline: {
      letterSpacing: 2,
    },
  },
  palette: {
    primary: {
      main: '#438E86',
    },
    secondary: {
      main: '#FFB6B6',
    },
  },
  components: {
    // Name of the component
    MuiButtonBase: {
      defaultProps: {
        // The props to change the default for.
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
    },
    MuiAvatar: {
      defaultProps: {
        variant: 'rounded',
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Terminal />
    </ThemeProvider>
  </React.StrictMode>,
);
