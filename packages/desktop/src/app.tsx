import { Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import * as React from 'react';

import ReactDOM from "react-dom/client";

const theme = createTheme({
  typography:{
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(',')
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
  },
});



const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>

<Typography>hahaha</Typography>
    
      <Button>Yooo</Button>
      </ThemeProvider>
    </React.StrictMode>
  );