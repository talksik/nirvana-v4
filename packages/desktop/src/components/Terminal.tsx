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
  Button,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Typography,
  AvatarGroup,
  Menu,
  MenuItem,
  ListItemIcon,
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
  FiHeadphones,
  FiLogOut,
  FiMonitor,
  FiWind,
  FiCloudRain,
} from 'react-icons/fi';
import { useSnackbar } from 'notistack';

import NirvanaLogo from './NirvanaLogo';

import Conversation, { ConversationMember } from '@nirvana/core/src/models/conversation.model';
import useAuth from '../providers/AuthProvider';
import {
  createOneOnOneConversation,
  getConversationContentQueryLIVE,
  getConversationsQueryLIVE,
  getUserById,
  joinConversation,
  leaveConversation,
  searchUsers,
  sendContentBlockToConversation,
} from '../firebase/firestore';
import { useImmer } from 'use-immer';
import { User } from '@nirvana/core/src/models/user.model';
import { onSnapshot, Unsubscribe } from 'firebase/firestore';

import NirvanaAvatar from './NirvanaAvatar';
import { useDebounce, useEffectOnce, useKeyPressEvent } from 'react-use';

import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import Channels from '../electron/constants';
import { uploadAudioClip } from '../firebase/firebaseStorage';
import { ContentBlock, ContentType } from '@nirvana/core/src/models/content.model';
type ConversationMap = {
  [conversationId: string]: Conversation;
};

type UserMap = {
  [userId: string]: User;
};

type ConversationContentMap = {
  [conversationId: string]: ContentBlock[];
};

interface ITerminalContext {
  conversationMap: ConversationMap;
  conversationContentMap: ConversationContentMap;

  selectedConversation?: Conversation;
  selectConversation?: (conversationId: string) => void;

  handleQuickDial?: (otherUserId: string) => void;

  getUser?: (userId: string) => Promise<User | undefined>;

  isUserSpeaking: boolean;
  isCloudDoingMagic: boolean;
}

const TerminalContext = React.createContext<ITerminalContext>({
  conversationMap: {},
  conversationContentMap: {},

  isUserSpeaking: false,
  isCloudDoingMagic: false,
});

// global audio data in memory
let audioChunks: Blob[] = [];
const handleMediaRecorderData = (e: BlobEvent) => {
  audioChunks.push(e.data);
};

const handleOnStartRecording = (e: BlobEvent) => {
  audioChunks = [];
};

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
  const { user, logout } = useAuth();

  const [selectedConversationId, setSelectedConversationId] = useState<string>(undefined);

  const [conversationMap, updateConversationMap] = useImmer<ConversationMap>({});
  const [userMap, updateUserMap] = useImmer<UserMap>({});
  const [conversationContentMap, updateContentMap] = useImmer<ConversationContentMap>({});

  // fetch conversations
  useEffect(() => {
    const unsub = onSnapshot(getConversationsQueryLIVE(user.uid), (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => doc.data());

      console.log('got new or updated conversations', conversations);

      updateConversationMap((draft) => {
        querySnapshot.docChanges().forEach((docChange) => {
          const currentConversation = docChange.doc.data();

          if (docChange.type === 'added') {
            console.log('New conversation: ', currentConversation);
            draft[currentConversation.id] = currentConversation;
          }
          if (docChange.type === 'modified') {
            console.log('Modified conversation: ', currentConversation);
            draft[currentConversation.id] = currentConversation;
          }
          if (docChange.type === 'removed') {
            console.log('Removed conversation: ', currentConversation);
            delete draft[currentConversation.id];
          }
        });
      });

      enqueueSnackbar('fetched conversations', { variant: 'success' });
    });

    return () => unsub();
  }, [user, updateConversationMap, enqueueSnackbar]);

  const [contentListeners, setContentListeners] = useImmer<{
    [conversationId: string]: Unsubscribe;
  }>({});
  // cached listeners for all content blocks of specific conversations?
  useEffect(() => {
    // go through all conversations
    Object.keys(conversationMap).forEach((conversationId) => {
      setContentListeners((draftListeners) => {
        // if we have a listener for conversation already, then just move on
        if (draftListeners[conversationId]) return;

        // if we don't, then create one for this conversation
        const contentListener = onSnapshot(
          getConversationContentQueryLIVE(conversationId),
          (querySnapshot) => {
            querySnapshot.docChanges().forEach((docChange) => {
              const currentContentBlock = docChange.doc.data();

              if (docChange.type === 'added') {
                // TODO: add to audio queue from here if there was an addition?
                enqueueSnackbar('new content received!', { variant: 'default' });
                updateContentMap((draftContent) => {
                  if (draftContent[conversationId]) {
                    draftContent[conversationId].push(currentContentBlock);
                  } else {
                    draftContent[conversationId] = [currentContentBlock];
                  }
                });
              }
              if (docChange.type === 'modified') {
                //
              }
              if (docChange.type === 'removed') {
                //
              }
            });
          },
        );

        //add to map of listeners

        draftListeners[conversationId] = contentListener;
      });
    });

    // ?optimization
    // ? only start listening to conversation content where it is in my priority box?
    // ? all other conversations, just fetch periodically?

    // TODO: future work/optimization
    // if we removed a conversation, unsubscribe from content listener as well

    return () => {
      Object.values(contentListeners).forEach((unsub) => unsub());
    };
  }, [conversationMap, updateContentMap, enqueueSnackbar, setContentListeners, contentListeners]);

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
      setSearchVal('');

      try {
        // check all current conversations which should be live listened to

        // if there is already a convo with exactly me and him, then select it
        const findExistingConversation = Object.values(conversationMap).find((convo) => {
          if (
            convo.memberIdsList?.length === 2 &&
            convo.memberIdsList.includes(user.uid) &&
            convo.memberIdsList.includes(otherUserId)
          ) {
            return true;
          }
          return false;
        });

        if (findExistingConversation) {
          enqueueSnackbar('quick dialed someone!', { variant: 'success' });
          setSelectedConversationId(findExistingConversation.id);
          return;
        }

        // create conversation in this case
        const newConversationId = await createOneOnOneConversation(otherUserId, user.uid);
        enqueueSnackbar('started conversation!', { variant: 'success' });
        setSelectedConversationId(newConversationId);
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

  const handleEscape = useCallback(() => {
    setSelectedConversationId(undefined);
  }, [setSelectedConversationId]);

  useKeyPressEvent('Shift', onSearchFocus);
  useKeyPressEvent('Escape', handleEscape);

  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  const [userAudioStream, setUserAudioStream] = useState<MediaStream>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>(null);

  // from the time of starting to speak to finally sent to everyone out there
  // feeling to user that everyone is listening right now even though it's only recording
  const [isCloudDoingMagic, setIsCloudDoingMagic] = useState<boolean>(false);

  const handleOnStopRecording = useCallback(async () => {
    console.log(audioChunks[0]);
    const blob = new Blob(audioChunks);

    const audioUrl = URL.createObjectURL(blob);
    const player = new Audio(audioUrl);
    player.autoplay = true;

    try {
      // ?should I send blob or first audio chunk in array?
      const downloadUrl = await uploadAudioClip(
        `${user.uid}-${new Date().valueOf()}`,
        audioChunks[0],
      );

      const contentBlock = new ContentBlock(
        user.uid,
        downloadUrl,
        ContentType.audio,
        audioChunks[0].type,
      );
      await sendContentBlockToConversation(contentBlock, selectedConversation.id);

      enqueueSnackbar('clip sent!', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Problem in recording clip', { variant: 'error' });
    }

    setIsCloudDoingMagic(false);
  }, [user.uid, setIsCloudDoingMagic, enqueueSnackbar, selectedConversation?.id]);

  const handleAskForMicrophonePermissions = useCallback(() => {
    // fix this...has to do with mac configuration
    // window.electronAPI.send(Channels.ASK_MICROPHONE_PERMISSIONS);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((localUserMedia: MediaStream) => {
        setUserAudioStream(localUserMedia);

        const userMediaRecoder = new MediaRecorder(localUserMedia);
        setMediaRecorder(userMediaRecoder);
        userMediaRecoder.ondataavailable = handleMediaRecorderData;
        userMediaRecoder.onstop = handleOnStopRecording;
        userMediaRecoder.onstart = handleOnStartRecording;

        enqueueSnackbar('got mic');

        console.log(localUserMedia);
      })
      .catch((error) => {
        enqueueSnackbar('Check your audio mic permissions in preferences!!', { variant: 'error' });
        console.error(error);
      });
  }, [setUserAudioStream, enqueueSnackbar, setMediaRecorder, handleOnStopRecording]);

  // on load, try getting microphone access
  useEffect(() => {
    handleAskForMicrophonePermissions();
  }, [handleAskForMicrophonePermissions]);

  //  when user wants to talk,
  //  unmute them and send clip for everyone to hear in the distance
  const handleBroadcast = useCallback(() => {
    if (!selectedConversation) {
      enqueueSnackbar('You must select a conversation first!!!', { variant: 'warning' });
      return;
    }

    if (!userAudioStream) {
      enqueueSnackbar('Check your audio mic permissions in preferences!!', { variant: 'error' });

      handleAskForMicrophonePermissions();
      return;
    }

    // prevent while delaying stopping
    // ? better to just start after 200 ms as put below for the delay of stopping recording?
    if (mediaRecorder.state === 'recording') return;

    enqueueSnackbar('started recording');
    setIsCloudDoingMagic(true);
    mediaRecorder.start();
    setIsUserSpeaking(true);
  }, [
    selectedConversation,
    setIsUserSpeaking,
    userAudioStream,
    mediaRecorder,
    handleAskForMicrophonePermissions,
    setIsCloudDoingMagic,
    enqueueSnackbar,
  ]);

  const handleStopBroadcast = useCallback(() => {
    if (isUserSpeaking) {
      setIsUserSpeaking(false);
      enqueueSnackbar('stopped...', { variant: 'info' });

      // actually stop talking after 2 seconds to capture everything
      setTimeout(() => {
        mediaRecorder.stop();
      }, 200);
    }
  }, [setIsUserSpeaking, isUserSpeaking, mediaRecorder, enqueueSnackbar]);

  useKeyPressEvent('`', handleBroadcast, handleStopBroadcast);

  const [, cancel] = useDebounce(
    async () => {
      if (searchVal) {
        enqueueSnackbar('searching...', { variant: 'info' });

        let results = await searchUsers(searchVal);
        results = results.filter((userResult) => userResult.id !== user.uid);
        setSearchUsersResults(results);

        console.warn('searched users', results);
      }

      setSearching(false);
    },
    1000,
    [searchVal, enqueueSnackbar, setSearchUsersResults, user],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearching(true);
      setSearchVal(e.target.value);
    },
    [setSearching, setSearchVal],
  );

  const selectConversation = useCallback(
    (conversationId: string) => setSelectedConversationId(conversationId),
    [setSelectedConversationId],
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <TerminalContext.Provider
      value={{
        isUserSpeaking,
        selectedConversation,
        conversationMap,
        getUser,
        handleQuickDial,
        selectConversation,
        isCloudDoingMagic,
        conversationContentMap,
      }}
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
            position: 'relative',
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
            {/* navbar */}
            <Stack
              direction="row"
              justifyContent={'flex-start'}
              alignItems={'center'}
              spacing={2}
              sx={{
                WebkitAppRegion: 'drag',
                cursor: 'pointer',
                pb: 1,
              }}
            >
              <NirvanaLogo />

              <Stack
                direction={'row'}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  bgcolor: blueGrey[100],
                  opacity: '50%',
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
                <IconButton color="default" size={'small'}>
                  <FiUsers />
                </IconButton>
              </Tooltip>
            </Stack>

            {searchVal ? (
              <ListPeople people={searchUsersResults} />
            ) : (
              <ListConversations
                lookingForSomeone={selectedConversationId && !selectedConversation}
              />
            )}
          </Stack>

          {/* footer controls */}
          <Box
            sx={{
              top: 'auto',
              bottom: 0,
              position: 'absolute',

              borderTop: '1px solid',
              borderTopColor: blueGrey[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 2,
              width: '100%',
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
                onClick={handleClick}
                size="small"
                sx={{ mr: 'auto', borderRadius: 1 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar alt={user.displayName} src={user.photoURL} />
              </IconButton>

              <Box
                sx={{
                  mr: 'auto',
                }}
                component="div"
              >
                <Button size={'small'} color={'secondary'} variant="text">
                  flow
                </Button>
              </Box>

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
          </Box>
        </Grid>

        <MainPanel />
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
        <ListSubheader
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography align={'center'} variant="subtitle2">
            Search Results
          </Typography>
        </ListSubheader>
      }
    >
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {people.length === 0 && (
          <Typography align="center" variant="caption">
            {`Can't find someone? Invite them!`}
          </Typography>
        )}
      </ListItem>

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

function ListConversations({ lookingForSomeone = false }: { lookingForSomeone: boolean }) {
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
        {lookingForSomeone && <CircularProgress />}

        {Object.values(conversationMap).map((currentConversation) => (
          <ConversationRow
            key={`${currentConversation.id}-priorityConvoList`}
            conversation={currentConversation}
          />
        ))}
      </List>

      <Divider />

      {/* <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader>
            <FiInbox />
            <Typography variant="subtitle2"> Inbox</Typography>
          </ListSubheader>
        }
      ></List> */}
    </>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const { getUser, selectedConversation, selectConversation } = useTerminal();

  const [conversationUsers, setConversationUsers] = useImmer<User[]>([]);

  useEffect(() => {
    (async () => {
      const userPromises = conversation.memberIdsList
        // .filter((memberId) => memberId !== user.uid)
        .map(async (memberId) => await getUser(memberId));

      const userSettled = await Promise.all(userPromises);

      setConversationUsers(userSettled);
    })();

    return;
  }, [conversation.memberIdsList, getUser, user, setConversationUsers]);

  return (
    <ListItem key={`${conversation.id}-priorityConvoList`}>
      <ListItemButton
        selected={selectedConversation?.id === conversation.id}
        onClick={() => selectConversation(conversation.id)}
      >
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
                sx={{
                  width: 30,
                  height: 30,
                  opacity: conversation.membersInRoom?.includes(conversationUser.uid)
                    ? '100%'
                    : '20%',
                }}
              />
            ))}
          </AvatarGroup>
        </ListItemAvatar>

        {/* <Typography variant={'caption'}>20 sec</Typography> */}
      </ListItemButton>
    </ListItem>
  );
}

function MainPanel() {
  const { user } = useAuth();
  const { selectedConversation } = useTerminal();

  // if selected conversation, show details
  // do all fetching necessary to paint things here
  // join the call so to speak

  // show who is

  return (
    <Grid item xs={8} sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      {selectedConversation ? (
        <ConversationDetails />
      ) : (
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            background: blueGrey[50],
          }}
        >
          <Typography variant="h6">{`Hi ${
            user.displayName?.split(' ')[0] ?? 'there'
          }!`}</Typography>
          <Typography variant="caption">Take a deep breath in.</Typography>
        </Container>
      )}
    </Grid>
  );
}

const maxPriorityConvos = 5;

function ConversationDetails() {
  const { user } = useAuth();
  const { getUser, selectedConversation, selectConversation, isCloudDoingMagic } = useTerminal();
  const [conversationUsers, setConversationUsers] = useImmer<User[]>([]);

  // TODO: at the terminal level, make sure we are listening for audio clips
  // and here it's just an access of that map of content for each conversation's blocks

  // the reference last active date based on current session of viewing this conversation
  const [lastActiveDate, setLastActiveDate] = useState<Date>(null);

  // join the room
  useEffect(() => {
    if (selectedConversation.membersInRoom?.length > 1) {
      // join the audio room with hms
    }
  }, [selectedConversation.membersInRoom]);

  // put me in the membersInRoom and leave every time I change conversations
  useEffect(() => {
    joinConversation(selectedConversation.id, user.uid);

    const handleCloseWindow = (event: BeforeUnloadEvent) => {
      leaveConversation(selectedConversation.id, user.uid);
    };

    window.addEventListener('beforeunload', handleCloseWindow);

    return () => {
      leaveConversation(selectedConversation.id, user.uid);
      window.removeEventListener('beforeunload', handleCloseWindow);
    };
  }, [selectedConversation.id, user.uid]);

  // update my last active date in this conversation for this viewing session's ui
  useEffect(() => {
    setLastActiveDate((prevLastActiveForCurrentSession) => {
      if (prevLastActiveForCurrentSession) return prevLastActiveForCurrentSession;

      return selectedConversation.members[user.uid].lastActiveDate?.toDate();
    });
  }, [selectedConversation.members, user.uid, setLastActiveDate]);

  // TODO: uncheck priority or not
  // soft max of 10...not going to enforce by counting all in database, but relying on client side list of convos

  useEffect(() => {
    (async () => {
      const userPromises = selectedConversation.memberIdsList
        // .filter((memberId) => memberId !== user.uid)
        .map(async (memberId) => await getUser(memberId));

      const userSettled = await Promise.all(userPromises);

      setConversationUsers(userSettled);
    })();

    return;
  }, [selectedConversation.memberIdsList, getUser, user, setConversationUsers]);

  return (
    <>
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
        <IconButton color="primary" size="small">
          <FiSun />
        </IconButton>

        <Typography sx={{ color: 'GrayText' }} variant={'overline'}>
          {selectedConversation.name ??
            conversationUsers.map((conversationUser) => conversationUser.displayName).join(', ')}
        </Typography>

        <AvatarGroup variant={'rounded'} sx={{ ml: 'auto' }}>
          {conversationUsers.map((conversationUser, index) => (
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

        <Box>
          <IconButton size="small">
            <FiMoreVertical />
          </IconButton>
        </Box>
      </Stack>

      <Container maxWidth={false} sx={{ position: 'relative', flex: 1 }}>
        <ConversationHistory />

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
    </>
  );
}

function ConversationHistory() {
  const { isCloudDoingMagic, selectedConversation, conversationContentMap } = useTerminal();

  const contentBlocks = conversationContentMap[selectedConversation?.id] ?? [];

  return (
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
        {contentBlocks.map((contentBlock) => (
          <Paper key={contentBlock.id} elevation={8} sx={{ p: 1, width: '100%' }}>
            <Stack direction={'row'} alignItems="center">
              {/* <Stack spacing={2} direction={'row'} alignItems={'center'}>
                <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />

                <Typography color={'GrayText'} variant="overline">
                  {'Viet Phan'}
                </Typography>
              </Stack> */}

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
        ))}

        {isCloudDoingMagic && (
          <IconButton size="small" color="secondary">
            <FiCloudRain />
          </IconButton>
        )}
      </Stack>
    </Container>
  );
}
