import {
  Box,
  Stack,
  IconButton,
  Avatar,
  Tooltip,
  Switch,
  Button,
  AvatarGroup,
  Fab,
  ListItemIcon,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';

import React from 'react';
import { FiHeadphones, FiSun, FiLogOut } from 'react-icons/fi';
import ConversationLabel from '../subcomponents/ConversationLabel';
import useTerminal from './Terminal';
import useAuth from '../providers/AuthProvider';

export default function FooterControls() {
  const { selectedConversation } = useTerminal();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderTopColor: blueGrey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 2,
        width: '100%',

        zIndex: 10,
        boxShadow: 10,

        bgcolor: blueGrey[200],
      }}
    >
      <Stack
        spacing={1}
        direction={'row'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        sx={{
          color: 'GrayText',
          p: 1,
          flex: 1,
        }}
      >
        <IconButton
          onClick={handleClickProfileMenu}
          size="small"
          sx={{ borderRadius: 1 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar alt={user.displayName} src={user.photoURL} />
        </IconButton>

        <Tooltip title={'overlay mode'}>
          <Switch color="secondary" size="small" />
        </Tooltip>

        <Stack direction={'row'} alignItems={'center'} component="div">
          <Tooltip title="Sound configuration">
            <IconButton color="inherit" size="small">
              <FiHeadphones />
            </IconButton>
          </Tooltip>

          <Button size={'small'} color={'secondary'} variant="text">
            flow
          </Button>
        </Stack>

        {selectedConversation && (
          <>
            <Stack
              direction={'row'}
              sx={{
                flex: 1,
                mx: 'auto',

                WebkitAppRegion: 'drag',
                cursor: 'pointer',
              }}
              alignItems={'center'}
              justifyContent={'center'}
              spacing={1}
            >
              <IconButton color="primary" size="small">
                <FiSun />
              </IconButton>

              <Box sx={{ color: 'GrayText' }}>
                <ConversationLabel
                  users={selectedConversation.userCache ?? []}
                  conversationName={selectedConversation.name}
                  isSelected={true}
                />
              </Box>
            </Stack>

            <AvatarGroup variant={'rounded'}>
              {selectedConversation.userCache?.map((conversationUser, index) => (
                <Avatar
                  key={`${selectedConversation.id}-${conversationUser.uid}-convoIcon`}
                  alt={conversationUser?.displayName}
                  src={conversationUser?.photoUrl}
                  sx={{
                    width: 30,
                    height: 30,
                    opacity: selectedConversation.membersInRoom?.includes(conversationUser.uid)
                      ? '100%'
                      : '20%',
                  }}
                />
              ))}
            </AvatarGroup>
          </>
        )}

        {/* todo: add a third mode which is when toggle broadcasting */}
        {selectedConversation ? (
          <Tooltip title="Speak or toggle by clicking here!">
            <Fab color="primary" aria-label="add" size="medium">
              <FiSun />
            </Fab>
          </Tooltip>
        ) : (
          <Tooltip title="No conversation selected!">
            <IconButton color="inherit" size="small">
              <FiSun />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleCloseProfileMenu}
        onClick={handleCloseProfileMenu}
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
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <FiLogOut />
          </ListItemIcon>
          <Typography color="warning">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
