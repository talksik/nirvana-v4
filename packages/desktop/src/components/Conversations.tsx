import React, { useCallback, useRef, useState } from 'react';

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
  CircularProgress,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { FiActivity, FiInbox, FiSearch, FiUsers } from 'react-icons/fi';
import NirvanaAvatar from './NirvanaAvatar';
import { useDebounce, useKey } from 'react-use';
import { useSnackbar } from 'notistack';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { searchUsers } from '../firebase/firestore';
import { User } from '@nirvana/core/src/models/user.model';
import useTerminal from './Terminal';

const Conversations = () => {
  const { enqueueSnackbar } = useSnackbar();

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchVal, setSearchVal] = useState<string>('');

  const onSearchFocus = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, [enqueueSnackbar, searchRef]);

  const [searchUsersResults, setSearchUsersResults] = useState<User[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useKey('Shift', onSearchFocus);

  const [, cancel] = useDebounce(
    async () => {
      if (searchVal) {
        enqueueSnackbar('searching...', { variant: 'info' });

        const results = await searchUsers(searchVal);
        setSearchUsersResults(results);

        console.warn(results);
      }

      setSearching(false);
    },
    500,
    [searchVal, enqueueSnackbar, setSearchUsersResults],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearching(true);
      setSearchVal(e.target.value);
    },
    [setSearching, setSearchVal],
  );

  return (
    <>
      <Stack direction={'row'} alignItems="center" justifyContent={'flex-start'} spacing={1}>
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
            flex: 1,
          }}
          alignItems={'center'}
          spacing={1}
        >
          <FiSearch style={{ color: blueGrey[500] }} />

          <Input
            onChange={handleChangeSearchInput}
            value={searchVal}
            placeholder={'Find or start a conversation'}
            inputRef={searchRef}
          />

          {searching && <CircularProgress size={20} />}

          <KeyboardShortcutLabel label="Shift" />
        </Stack>

        <Tooltip title={'Group conversation'}>
          <IconButton color="secondary" size={'small'}>
            <FiUsers />
          </IconButton>
        </Tooltip>
      </Stack>

      {searchVal ? <ListPeople people={searchUsersResults} /> : <ListConversations />}
    </>
  );
};

function ListPeople({ people }: { people: User[] }) {
  return (
    <List
      sx={{
        pt: 2,
      }}
      subheader={
        <ListSubheader>
          <Typography variant="subtitle2"> Search Results</Typography>
        </ListSubheader>
      }
    >
      {people.length === 0 && (
        <Typography align="center" variant="caption">
          {`Can't find someone? Invite them!`}
        </Typography>
      )}

      {people.map((person) => (
        <ListItem key={`${person.uid}-searchUsers`}>
          <ListItemButton selected={true}>
            <ListItemAvatar>
              <Avatar alt={person.displayName} src={person.photoUrl} />
            </ListItemAvatar>

            <ListItemText primary={person.displayName} />

            <Typography variant={'caption'}>20 sec</Typography>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

function ListConversations() {
  const { conversations } = useTerminal();

  if (conversations.length === 0) {
    return (
      <Typography align="center" variant="caption">
        Look for someone by name or email to start a conversation!
      </Typography>
    );
  }

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
}

export default Conversations;
