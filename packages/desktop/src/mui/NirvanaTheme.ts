import { createTheme } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

export const NirvanaTheme = createTheme({
  typography: {
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    overline: {
      letterSpacing: 2,
    },
    caption: {
      color: blueGrey[200],
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
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: '0.9em',
        },
      },
      defaultProps: {
        disableUnderline: true,
        fullWidth: true,
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          '&.MuiListSubheader-root': {
            lineHeight: 1,
            display: 'flex',
            gap: '0.7em',
            alignItems: 'center',
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});
