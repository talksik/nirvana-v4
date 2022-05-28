import { Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import * as React from 'react';

import ReactDOM from 'react-dom/client';
import Terminal from './components/Terminal';

import { SnackbarProvider } from 'notistack';
import { NirvanaTheme } from './mui/NirvanaTheme';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={NirvanaTheme}>
      <SnackbarProvider maxSnack={3}>
        <Terminal />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
