import React, { useCallback, useRef } from 'react';

import { Container } from '@mui/system';
import {
  Avatar,
  Box,
  Divider,
  Fab,
  Grid,
  IconButton,
  Input,
  ListItemIcon,
  Menu,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import {
  FiHeadphones,
  FiLogOut,
  FiMonitor,
  FiMoreVertical,
  FiPlay,
  FiSearch,
  FiSun,
  FiWind,
} from 'react-icons/fi';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { useSnackbar } from 'notistack';
import { useKey } from 'react-use';

import MenuItem from '@mui/material/MenuItem';
import useAuth from '../providers/AuthProvider';
import Conversations from './Conversations';
import Navbar from './Navbar';

export default function Terminal() {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Grid container spacing={0}>
      <Grid
        item
        xs={4}
        sx={{
          zIndex: 2,
          backgroundColor: blueGrey[50],
          boxShadow: 3,
          borderRight: `1px solid ${blueGrey}`,
        }}
      >
        <Stack
          direction={'column'}
          spacing={1}
          sx={{
            p: 2,
            height: 'inherit',
          }}
        >
          <Navbar />

          <SecondNavbar />

          <Conversations />
        </Stack>
      </Grid>

      <Grid item xs={8} sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction={'row'}
          sx={{
            py: 2,
            px: 2,
            borderBottom: '1px solid',
            borderBottomColor: blueGrey[100],
            WebkitAppRegion: 'drag',
            cursor: 'pointer',
          }}
          alignItems={'center'}
          justifyContent={'flex-start'}
        >
          <Stack spacing={2} direction={'row'} alignItems={'center'}>
            <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />

            <Typography color={'GrayText'} variant="overline">
              {'Viet Phan'}
            </Typography>
          </Stack>

          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small">
              <FiMoreVertical />
            </IconButton>
          </Box>
        </Stack>

        <Container maxWidth={false} sx={{ position: 'relative', flex: 1 }}>
          <Container maxWidth="xs">
            <Stack
              justifyContent={'flex-start'}
              alignItems={'center'}
              sx={{
                pt: 2,
              }}
            >
              <Typography variant="caption">yesterday</Typography>

              <Paper elevation={1} sx={{ p: 1, width: '100%' }}>
                <Stack direction={'row'} alignItems="center">
                  <Stack spacing={2} direction={'row'} alignItems={'center'}>
                    <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />

                    <Typography color={'GrayText'} variant="overline">
                      {'Viet Phan'}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      ml: 'auto',
                      color: 'GrayText',
                    }}
                  >
                    <FiPlay />
                  </Box>
                </Stack>
              </Paper>
            </Stack>

            <Stack
              justifyContent={'flex-start'}
              alignItems={'center'}
              sx={{
                pt: 2,
              }}
            >
              <Typography variant="caption">today</Typography>

              <Paper elevation={8} sx={{ p: 1, width: '100%' }}>
                <Stack direction={'row'} alignItems="center">
                  <Stack spacing={2} direction={'row'} alignItems={'center'}>
                    <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />

                    <Typography color={'GrayText'} variant="overline">
                      {'Viet Phan'}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      ml: 'auto',
                      color: 'GrayText',
                    }}
                  >
                    <FiPlay />
                  </Box>
                </Stack>
              </Paper>
            </Stack>

            <Stack
              justifyContent={'flex-start'}
              alignItems={'center'}
              sx={{
                pt: 2,
              }}
            >
              <Typography variant="caption">right now</Typography>

              <Paper elevation={24} sx={{ p: 1, width: '100%' }}>
                <Stack direction={'row'} alignItems="center">
                  <Stack spacing={2} direction={'row'} alignItems={'center'}>
                    <Avatar
                      alt={'Arjun Patel'}
                      src="https://lh3.googleusercontent.com/ogw/ADea4I6TRqnIptWNP25-iXdusoAHafj-cUPYkO53xKT2_H0=s64-c-mo"
                    />

                    <Typography color={'GrayText'} variant="overline">
                      {'Arjun Patel'}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      ml: 'auto',
                      color: 'GrayText',
                    }}
                  >
                    <FiPlay />
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Container>

          <Box
            sx={{
              position: 'absolute',
              zIndex: 10,
              bottom: 0,
              right: 0,
              padding: 3,
            }}
          >
            <Fab color="primary" aria-label="add" size="medium">
              <FiSun />
            </Fab>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}

const searchShortcut = 'Shift';
const SecondNavbar = () => {
  const { enqueueSnackbar } = useSnackbar();

  const searchRef = useRef<HTMLInputElement>(null);

  const onSearch = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, []);

  useKey('Shift', onSearch);

  return (
    <Stack
      direction={'row'}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        bgcolor: blueGrey[100],
        borderRadius: 1,
        px: 1,
        py: 0.5,
      }}
      alignItems={'center'}
      spacing={1}
    >
      <FiSearch style={{ color: blueGrey[500] }} />

      <Input placeholder={'Find or start a conversation'} inputRef={searchRef} />

      <KeyboardShortcutLabel label="Shift" />
    </Stack>
  );
};
