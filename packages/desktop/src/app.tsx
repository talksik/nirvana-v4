import * as React from 'react';

import { AuthProvider } from './providers/AuthProvider';
import { ConversationProvider } from './providers/ConversationProvider';
import { ElectronProvider } from './providers/ElectronProvider';
import ErrorParent from './providers/ErrorBoundary';
import { NirvanaTheme } from './mui/NirvanaTheme';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { TerminalProvider } from './components/Terminal';
import { ThemeProvider } from '@mui/material';
import { ZenProvider } from './providers/ZenProvider';
import { connectCore } from '@nirvana/core/src/index';

connectCore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ThemeProvider theme={NirvanaTheme}>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <ErrorParent>
        <ElectronProvider>
          <AuthProvider>
            <ConversationProvider>
              <ZenProvider>
                <TerminalProvider>
                  <></>
                </TerminalProvider>
              </ZenProvider>
            </ConversationProvider>
          </AuthProvider>
        </ElectronProvider>
      </ErrorParent>
    </SnackbarProvider>
  </ThemeProvider>,
);
