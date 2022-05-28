import React, { useCallback, useRef } from 'react';

import {
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  Input,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { FiActivity, FiInbox, FiSearch } from 'react-icons/fi';
import NirvanaAvatar from './NirvanaAvatar';
import { useKey } from 'react-use';
import { useSnackbar } from 'notistack';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';

const Conversations = () => {
  const { enqueueSnackbar } = useSnackbar();

  const searchRef = useRef<HTMLInputElement>(null);

  const onSearch = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, []);

  useKey('Shift', onSearch);

  return (
    <>
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

export default Conversations;
