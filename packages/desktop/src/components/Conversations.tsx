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
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { FiActivity, FiInbox, FiSearch } from 'react-icons/fi';
import NirvanaAvatar from './NirvanaAvatar';
import { useDebounce, useKey } from 'react-use';
import { useSnackbar } from 'notistack';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { searchUsers, User } from '../firebase/firestore';

const Conversations = () => {
  const { enqueueSnackbar } = useSnackbar();

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchVal, setSearchVal] = useState<string>('');

  const onSearchFocus = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, [enqueueSnackbar, searchRef]);

  const [searchUsersResults, setSearchUsersResults] = useState<User[]>([]);

  useKey('Shift', onSearchFocus);

  const [, cancel] = useDebounce(
    async () => {
      if (searchVal) {
        enqueueSnackbar('searching...', { variant: 'info' });

        const results = await searchUsers(searchVal);
        setSearchUsersResults(results);

        console.warn(results);
      }
    },
    500,
    [searchVal, enqueueSnackbar, setSearchUsersResults],
  );

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

        <Input
          onChange={(e) => setSearchVal(e.target.value)}
          value={searchVal}
          placeholder={'Find or start a conversation'}
          inputRef={searchRef}
        />

        <KeyboardShortcutLabel label="Shift" />
      </Stack>

      {searchVal && <ListPeople people={searchUsersResults} />}

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
        <Typography variant="caption">
          Sorry please try someone else or invite them to nirvana.
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
export default Conversations;
