import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Container,
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
import { FiHeadphones, FiHelpCircle, FiLink, FiLogOut, FiSun } from 'react-icons/fi';
import React, { useCallback } from 'react';

import ConversationLabel from '../subcomponents/ConversationLabel';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import useTerminal from './Terminal';

export default function FooterControls() {
  const { handleOmniSearch } = useTerminal();
  const { selectedConversation } = useConversations();
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
    handleOmniSearch(SUPPORT_DISPLAY_NAME);
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
        width: '100%',

        zIndex: 10,
        boxShadow: 10,

        bgcolor: blueGrey[800],
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        sx={{
          color: 'GrayText',
          p: 1,
          flex: 1,
        }}
      >
        <Stack spacing={1} direction={'row'} alignItems={'center'}>
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

          <Tooltip title="Sound configuration">
            <IconButton
              sx={{
                color: 'white',
              }}
              size="small"
            >
              <FiHeadphones />
            </IconButton>
          </Tooltip>

          <Tooltip title={'overlay mode'}>
            <Switch color="secondary" size="small" />
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
              <Container
                maxWidth={'sm'}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <IconButton color="primary" size="small">
                  <FiSun />
                </IconButton>

                <ConversationLabel
                  users={selectedConversation.userCache ?? []}
                  conversationName={selectedConversation.name}
                  isSelected={true}
                />
              </Container>
            </Stack>

            <Stack sx={{ ml: 'auto' }} direction={'row'} spacing={1}>
              <AvatarGroup variant={'rounded'}>
                {selectedConversation.userCache?.map((conversationUser, index) => (
                  <Avatar
                    key={`${selectedConversation.id}-${conversationUser.uid}-convoIcon`}
                    alt={conversationUser?.displayName}
                    src={conversationUser?.photoUrl}
                    sx={{
                      opacity: selectedConversation.membersInRoom?.includes(conversationUser.uid)
                        ? '100%'
                        : '20%',
                    }}
                  />
                ))}
              </AvatarGroup>

              <Tooltip title="No conversation selected!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiLink />
                </IconButton>
              </Tooltip>

              {/* todo: not speaking mode, speaking mode, locked in mode */}
              <Tooltip title="Speak or toggle by clicking here!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiSun />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
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
