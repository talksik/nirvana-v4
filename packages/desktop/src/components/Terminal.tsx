import React, { useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { Container } from '@mui/system';
import {
  Avatar,
  Box,
  Fab,
  Grid,
  Paper,
  Input,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Typography,
  AvatarGroup,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import {
  FiMoreVertical,
  FiPlay,
  FiSun,
  FiActivity,
  FiInbox,
  FiSearch,
  FiUsers,
  FiCoffee,
  FiCircle,
} from 'react-icons/fi';
import { useSnackbar } from 'notistack';

import Navbar from './Navbar';
import Conversation from '@nirvana/core/src/models/conversation.model';
import useAuth from '../providers/AuthProvider';
import {
  createOneOnOneConversation,
  getConversationsQueryLIVE,
  getUserById,
  searchUsers,
} from '../firebase/firestore';
import { Link, AudioClip, Image } from '@nirvana/core/src/models/content.model';
import { useImmer } from 'use-immer';
import { User } from '@nirvana/core/src/models/user.model';
import { onSnapshot } from 'firebase/firestore';

import NirvanaAvatar from './NirvanaAvatar';
import { useDebounce, useKey } from 'react-use';

import KeyboardShortcutLabel from './KeyboardShortcutLabel';
type ConversationMap = {
  [conversationId: string]: Conversation;
};

type UserMap = {
  [userId: string]: User;
};

type ConversationContentMap = {
  [conversationId: string]: { audio: AudioClip[]; links: Link[]; images: Image[] };
};

interface ITerminalContext {
  conversationMap: ConversationMap;

  selectedConversation?: Conversation;

  handleQuickDial?: (otherUserId: string) => void;

  getUser?: (userId: string) => Promise<User | undefined>;
}

const TerminalContext = React.createContext<ITerminalContext>({
  conversationMap: {},
});

// TODOS
// fetch all conversations that I am part of

// create a convo
// 1. search
// 2. click on person
// 3. search database if there is already a convo for this
//   - if yes: select this one
//   - if no: create one
// 4. show the conversation details page show on right
// 5. connect live if other person there
// 6. send first clip
// 7. display all blocks/clips for convo simple and separate

// if no conversations, show stale state + create one with nirvana

// sort based on the different data sources: conversations, audio clips, etc.

// todo: extract each use effect to custom hook and will be clean
export function TerminalProvider({ children }: { children?: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [selectedConversationId, setSelectedConversationId] = useState<string>(undefined);

  const [conversationMap, updateConversationMap] = useImmer<ConversationMap>({});
  const [userMap, updateUserMap] = useImmer<UserMap>({});
  const [contentMap, updatecontentMap] = useImmer<ConversationContentMap>({});

  // fetch conversations
  useEffect(() => {
    const unsub = onSnapshot(getConversationsQueryLIVE(user.uid), (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => doc.data());

      updateConversationMap((draft) => {
        conversations.forEach((convo) => {
          draft[convo.id] = convo;
        });
      });

      enqueueSnackbar('got conversations...logging', { variant: 'success' });
    });

    return () => unsub();
  }, [user, enqueueSnackbar, updateConversationMap]);

  // cache of selected conversation
  const selectedConversation: Conversation | undefined = useMemo(() => {
    if (!selectedConversationId) return undefined;

    // select if we do have it

    const conversation = conversationMap[selectedConversationId];

    if (!conversation) {
      enqueueSnackbar('no conversation found', { variant: 'error' });
      console.error('Should have found it... maybe retry once more');
    }

    return conversation;

    // get conversation if not here
    // const fetchedConversation = await getConversationById

    // return undefined;
  }, [selectedConversationId, conversationMap, enqueueSnackbar]);

  // handle create or open existing conversation
  // not 100% consistent to the second, but still works...don't need atomicity
  const handleQuickDial = useCallback(
    async (otherUserId: string) => {
      try {
        // check all current conversations which should be live listened to

        // if there is already a convo with exactly me and him, then select it
        const findExistingConversation = Object.values(conversationMap).find((convo) => {
          if (
            convo.membersList?.length === 2 &&
            convo.membersList.includes(user.uid) &&
            convo.membersList.includes(otherUserId)
          ) {
            return true;
          }
          return false;
        });

        if (findExistingConversation) {
          setSelectedConversationId(findExistingConversation.id);
          return;
        }

        // create conversation in this case
        const newConversationId = await createOneOnOneConversation(otherUserId, user.uid);

        enqueueSnackbar('started conversation!', { variant: 'success' });

        setSelectedConversationId(newConversationId);

        setSearchVal('');
      } catch (error) {
        enqueueSnackbar('Something went wrong, please try again', { variant: 'error' });
      }
    },
    [conversationMap, enqueueSnackbar, user],
  );

  const getUser = useCallback(
    async (userId: string) => {
      if (userMap[userId]) return userMap[userId];

      const fetchedUser = await getUserById(userId);

      updateUserMap((draft) => {
        draft[userId] = fetchedUser;
      });

      return fetchedUser;
    },
    [userMap, updateUserMap],
  );

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
    <TerminalContext.Provider
      value={{ selectedConversation, conversationMap, getUser, handleQuickDial }}
    >
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
          </Stack>
        </Grid>

        {/* selected conversation details */}
        {selectedConversation && (
          <Grid
            item
            xs={8}
            sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}
          >
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
                        <Avatar
                          alt={'Arjun Patel'}
                          src="https://mui.com/static/images/avatar/2.jpg"
                        />

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
                        <Avatar
                          alt={'Arjun Patel'}
                          src="https://mui.com/static/images/avatar/2.jpg"
                        />

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
        )}
      </Grid>

      {children}
    </TerminalContext.Provider>
  );
}

export default function useTerminal() {
  return useContext(TerminalContext);
}

function ListPeople({ people }: { people: User[] }) {
  const { handleQuickDial } = useTerminal();

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
          <ListItemButton onClick={() => handleQuickDial(person.uid)}>
            <ListItemAvatar>
              <Avatar alt={person.displayName} src={person.photoUrl} />
            </ListItemAvatar>

            <ListItemText primary={person.displayName} />

            <ListItemSecondaryAction sx={{ color: 'GrayText' }}>
              <FiCoffee />
            </ListItemSecondaryAction>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

function ListConversations() {
  const { conversationMap } = useTerminal();

  if (Object.keys(conversationMap).length === 0) {
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
        {Object.values(conversationMap).map((currentConversation) => (
          <ConversationRow
            key={`${currentConversation.id}-priorityConvoList`}
            conversation={currentConversation}
          />
        ))}
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
      ></List>
    </>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const { getUser, selectedConversation } = useTerminal();

  const [conversationUsers, setConversationUsers] = useImmer<User[]>([]);

  useEffect(() => {
    (async () => {
      const userPromises = conversation.membersList
        .filter((memberId) => memberId !== user.uid)
        .map(async (memberId) => await getUser(memberId));

      const userSettled = await Promise.all(userPromises);

      setConversationUsers(userSettled);
    })();

    return;
  }, [conversation.membersList, getUser, user, setConversationUsers]);

  return (
    <ListItem key={`${conversation.id}-priorityConvoList`}>
      <ListItemButton selected={selectedConversation?.id === conversation.id}>
        <Box sx={{ color: 'GrayText', fontSize: 10, mr: 2 }}>
          <FiCircle />
        </Box>

        <Typography sx={{ mr: 'auto', color: 'GrayText' }} variant={'overline'}>
          {conversationUsers.map((conversationUser) => conversationUser.displayName).join(', ')}
        </Typography>

        <ListItemAvatar>
          <AvatarGroup variant={'rounded'}>
            {conversationUsers.map((conversationUser, index) => (
              <Avatar
                key={`${conversation.id}-${conversationUser.uid}-convoIcon`}
                alt={conversationUser?.displayName}
                src={conversationUser?.photoUrl}
              />
            ))}
          </AvatarGroup>
        </ListItemAvatar>

        {/* <Typography variant={'caption'}>20 sec</Typography> */}
      </ListItemButton>
    </ListItem>
  );
}
