import { ThemeProvider } from '@mui/material';
import * as React from 'react';

import ReactDOM from 'react-dom/client';
import Terminal from './components/Terminal';

import { SnackbarProvider } from 'notistack';
import { NirvanaTheme } from './mui/NirvanaTheme';
import { ElectronProvider } from './providers/ElectronProvider';
import { AuthProvider } from './providers/AuthProvider';
import realmApp from './realm/connect';

realmApp;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={NirvanaTheme}>
      <SnackbarProvider maxSnack={3}>
        <ElectronProvider>
          <AuthProvider>
            <Terminal />
          </AuthProvider>
        </ElectronProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
