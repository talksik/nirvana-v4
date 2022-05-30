import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Divider,
  Fab,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { FiHeadphones, FiHelpCircle, FiLogOut, FiSun } from 'react-icons/fi';
import React, { useCallback } from 'react';

import ConversationLabel from '../subcomponents/ConversationLabel';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import useTerminal from './Terminal';

export default function FooterControls() {
  const { selectedConversation, handleOmniSearch } = useTerminal();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleQuickDialSupport = useCallback(() => {
    handleOmniSearch('Nirvana Support');
  }, [handleOmniSearch]);

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
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={handleQuickDialSupport}>
          <ListItemIcon>
            <FiHelpCircle />
          </ListItemIcon>
          <Typography>Help</Typography>
        </MenuItem>

        <Divider />
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
