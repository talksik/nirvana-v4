import { createTheme, experimental_sx as sx } from '@mui/material';

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
    button: {
      textTransform: 'none',
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
      styleOverrides: {
        root: sx({
          boxShadow: 1,
        }),
      },
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

    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '2px 0 2px 0 !important',
        },
      },
      defaultProps: {
        disableGutters: true,
        disablePadding: false,
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          '&.MuiListSubheader-root': {
            lineHeight: 2,
            paddingBottom: '4px',
            display: 'flex',
            gap: '0.7em',
            alignItems: 'center',
            backgroundColor: 'transparent',
          },
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
      },
    },
  },
});
