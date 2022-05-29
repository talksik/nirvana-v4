import React from 'react';

import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { FiHeadphones, FiLogOut, FiMonitor, FiWind } from 'react-icons/fi';

import MenuItem from '@mui/material/MenuItem';
import useAuth from '../providers/AuthProvider';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logout, user } = useAuth();

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
          sx={{ ml: 1, borderRadius: 1 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar alt={user.displayName} src={user.photoURL} />
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

export default Navbar;
