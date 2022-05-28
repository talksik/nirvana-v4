import { ThemeProvider } from '@mui/material';
import * as React from 'react';

import ReactDOM from 'react-dom/client';
import { TerminalProvider } from './components/Terminal';

import { SnackbarProvider } from 'notistack';
import { NirvanaTheme } from './mui/NirvanaTheme';
import { ElectronProvider } from './providers/ElectronProvider';
import { AuthProvider } from './providers/AuthProvider';

import ErrorParent from './providers/ErrorBoundary';
import { connectCore } from '@nirvana/core/src/index';

connectCore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={NirvanaTheme}>
      <SnackbarProvider maxSnack={3}>
        <ErrorParent>
          <ElectronProvider>
            <AuthProvider>
              <TerminalProvider />
            </AuthProvider>
          </ElectronProvider>
        </ErrorParent>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
