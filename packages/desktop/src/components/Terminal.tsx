import React, { useCallback, useRef } from 'react';

import { Container } from '@mui/system';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Fab,
  Grid,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import {
  FiActivity,
  FiHeadphones,
  FiInbox,
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
import NirvanaAvatar from './NirvanaAvatar';

import MenuItem from '@mui/material/MenuItem';
import useAuth from '../providers/AuthProvider';

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

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logout } = useAuth();

  return (
    <>
      <Stack
        direction="row"
        justifyContent={'flex-start'}
        alignItems={'center'}
        sx={{
          WebkitAppRegion: 'drag',
          cursor: 'pointer',
          pb: 1,
        }}
      >
        <NirvanaLogo />

        <Stack
          spacing={1}
          direction={'row'}
          alignItems={'center'}
          sx={{
            ml: 'auto',
            mr: 1,
            color: 'GrayText',
          }}
        >
          <Tooltip title="Sound configuration">
            <IconButton color="inherit" size="small">
              <FiHeadphones />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desktop modes">
            <IconButton color="inherit" size="small">
              <FiMonitor />
            </IconButton>
          </Tooltip>
          <Tooltip title="Flow state">
            <IconButton color="inherit" size="small">
              <FiWind />
            </IconButton>
          </Tooltip>
        </Stack>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2, borderRadius: 1 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            alt={'Arjun Patel'}
            src="https://lh3.googleusercontent.com/ogw/ADea4I6TRqnIptWNP25-iXdusoAHafj-cUPYkO53xKT2_H0=s64-c-mo"
          />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem>
          <Avatar /> My account
        </MenuItem>

        <Divider />

        <MenuItem onClick={logout}>
          <ListItemIcon>
            <FiLogOut />
          </ListItemIcon>
          <Typography color="warning">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

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

const Conversations = () => {
  return (
    <>
      <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader>
            <FiActivity />
            <Typography variant="subtitle2"> Priority</Typography>
          </ListSubheader>
        }
      >
        <ListItem>
          <ListItemButton selected={true}>
            <ListItemAvatar>
              <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />
            </ListItemAvatar>

            <ListItemText primary="Viet" />

            <Typography variant={'caption'}>20 sec</Typography>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton>
            <ListItemAvatar>
              <NirvanaAvatar
                avatars={[
                  { alt: 'Arjun Patel', src: 'https://mui.com/static/images/avatar/3.jpg' },
                ]}
              />
            </ListItemAvatar>

            <ListItemText primary="Agnes" />

            <Typography variant={'caption'}>34 min ago</Typography>
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader>
            <FiInbox />
            <Typography variant="subtitle2"> Inbox</Typography>
          </ListSubheader>
        }
      >
        <ListItem>
          <ListItemButton sx={{ opacity: 0.5 }}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  filter: `grayscale(1)`,
                }}
                alt={'Arjun Patel'}
                src="https://mui.com/static/images/avatar/5.jpg"
              />
            </ListItemAvatar>

            <ListItemText secondary="Jeremy Leon" sx={{ color: blueGrey[300] }} />

            <Badge color="primary" badgeContent=" " variant="dot"></Badge>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton sx={{ opacity: 0.5 }}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  filter: `grayscale(1)`,
                }}
                alt={'Arjun Patel'}
                src="https://mui.com/static/images/avatar/4.jpg"
              />
            </ListItemAvatar>

            <ListItemText secondary="James Lin" sx={{ color: blueGrey[300] }} />

            <Typography variant={'caption'}>2 hours ago</Typography>
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
};
