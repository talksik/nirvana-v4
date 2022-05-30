import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Dialog,
  Divider,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { ContentBlock, ContentType } from '@nirvana/core/src/models/content.model';
import { FiHeadphones, FiLogOut, FiMonitor, FiSun, FiZap } from 'react-icons/fi';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Unsubscribe, onSnapshot } from 'firebase/firestore';
import {
  createOneOnOneConversation,
  getConversationContentQueryLIVE,
  getConversationsQueryLIVE,
  getUserById,
  searchUsers,
  sendContentBlockToConversation,
} from '../firebase/firestore';
import { useDebounce, useKeyPressEvent, useRendersCount, useUnmount } from 'react-use';

import Conversation from '@nirvana/core/src/models/conversation.model';
import ConversationLabel from '../subcomponents/ConversationLabel';
import { ConversationList } from './ConversationList';
import FooterControls from './FooterControls';
import MainPanel from './MainPanel';
import Navbar from './Navbar';
import NewConversationDialog from './NewConversationDialog';
import { User } from '@nirvana/core/src/models/user.model';
import { blueGrey } from '@mui/material/colors';
import { createGroupConversation } from '../firebase/firestore';
import { uploadAudioClip } from '../firebase/firebaseStorage';
import useAuth from '../providers/AuthProvider';
import { useImmer } from 'use-immer';
import { useSnackbar } from 'notistack';

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

  handleQuickDial?: (otherUser: User) => void;

  getUser?: (userId: string) => Promise<User | undefined>;

  isUserSpeaking: boolean;
  isCloudDoingMagic: boolean;

  createConversationMode: boolean;
  handleShowCreateConvoForm?: () => void;

  handleEscape?: () => void;

  handleOmniSearch?: (searchQuery: string) => void; // handle searching for anything globally
}

const TerminalContext = React.createContext<ITerminalContext>({
  conversationMap: {},
  conversationContentMap: {},

  isUserSpeaking: false,
  isCloudDoingMagic: false,

  createConversationMode: false,
});

// global audio data in memory
let audioChunks: Blob[] = [];
const handleMediaRecorderData = (e: BlobEvent) => {
  audioChunks.push(e.data);
};

const handleOnStartRecording = (e: BlobEvent) => {
  audioChunks = [];
};

// todo: extract each use effect to custom hook and will be clean
export function TerminalProvider({ children }: { children?: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, logout, nirvanaUser } = useAuth();

  const [selectedConversationId, setSelectedConversationId] = useState<string>(undefined);

  const [conversationMap, updateConversationMap] = useImmer<ConversationMap>({});
  const [userMap, updateUserMap] = useImmer<UserMap>({});
  const [conversationContentMap, updateContentMap] = useImmer<ConversationContentMap>({});

  const [contentListeners, setContentListeners] = useImmer<{
    [conversationId: string]: Unsubscribe;
  }>({});

  // TODO: put in a custom hook to separate out logic
  const addConversationContentListener = useCallback(
    (conversationId: string) => {
      // ?optimization
      // ? only start listening to conversation content where it is in my priority box?
      // ? all other conversations, just fetch periodically?

      // TODO: future work/optimization
      // if we removed a conversation, unsubscribe from content listener as well

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
    },
    [setContentListeners, updateContentMap],
  );

  // fetch conversations
  // TODO: put members map in another collection to avoid all of the re-renders for all folks...
  // duplicate data for better reads
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

            addConversationContentListener(currentConversation.id);
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
    });

    return () => unsub();
  }, [user, updateConversationMap, enqueueSnackbar, addConversationContentListener]);

  // on unmount, get rid of all content listeners
  useUnmount(() => {
    Object.values(contentListeners).forEach((unsub) => unsub());
  });

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
    async (otherUser: User) => {
      setSearchVal('');

      try {
        // check all current conversations which should be live listened to

        // if there is already a convo with exactly me and him, then select it
        const findExistingConversation = Object.values(conversationMap).find((convo) => {
          if (
            convo.memberIdsList?.length === 2 &&
            convo.memberIdsList.includes(nirvanaUser.id) &&
            convo.memberIdsList.includes(otherUser.id)
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
        const newConversationId = await createOneOnOneConversation(otherUser, nirvanaUser);
        enqueueSnackbar('started conversation!', { variant: 'success' });
        setSelectedConversationId(newConversationId);
      } catch (error) {
        enqueueSnackbar('Something went wrong, please try again', { variant: 'error' });
      }
    },
    [conversationMap, enqueueSnackbar, nirvanaUser],
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

  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  const [userAudioStream, setUserAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
        if (!localUserMedia.active) {
          enqueueSnackbar('Make sure your microphone is enabled!', { variant: 'error' });
          return;
        }

        localUserMedia.getTracks().forEach((track) => track.stop());

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
    // handleAskForMicrophonePermissions();
  }, [handleAskForMicrophonePermissions]);

  //  when user wants to talk,
  //  unmute them and send clip for everyone to hear in the distance
  const handleBroadcast = useCallback(() => {
    if (!selectedConversation) {
      enqueueSnackbar('You must select a conversation first!!!', { variant: 'warning' });
      return;
    }

    if (!userAudioStream || !mediaRecorder) {
      enqueueSnackbar('Configure your audio!!', { variant: 'error' });

      handleAskForMicrophonePermissions();
      return;
    }

    // prevent while delaying stopping
    // ? better to just start after 200 ms as put below for the delay of stopping recording?
    if (mediaRecorder.state === 'recording') {
      enqueueSnackbar(`Please don't spam!!!`, { variant: 'warning' });
      return;
    }

    try {
      enqueueSnackbar('started recording');
      setIsCloudDoingMagic(true);
      mediaRecorder.start();
      setIsUserSpeaking(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Problem in your audio!!!', { variant: 'error' });
      setIsCloudDoingMagic(false);
      setIsUserSpeaking(false);
    }
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

  const [searchVal, setSearchVal] = useState<string>('');
  const [searchUsersResults, setSearchUsersResults] = useState<User[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

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

  const handleOmniSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery) {
        return;
      }

      setSearching(true);
      setSearchVal(searchQuery.replace('/', ''));
    },
    [setSearching, setSearchVal],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleOmniSearch(e.target.value);
    },
    [handleOmniSearch],
  );

  const selectConversation = useCallback(
    (conversationId: string) => setSelectedConversationId(conversationId),
    [setSelectedConversationId],
  );

  const [createConversationMode, setCreateConversationMode] = useState<boolean>(false);

  const handleStartConversation = useCallback(
    async (selectedUsers: User[], conversationName?: string) => {
      if (selectedUsers.length === 0) {
        enqueueSnackbar('Must select more than one person');
        return;
      }

      try {
        // one on one, handle quick dial to prevent another conversation
        if (selectedUsers.length === 1) {
          await handleQuickDial(selectedUsers[0]);

          setCreateConversationMode(false);
          return;
        }

        // create group chat
        // create conversation in this case
        const newConversationId = await createGroupConversation(
          selectedUsers,
          nirvanaUser,
          conversationName ?? null,
        );
        enqueueSnackbar('started group conversation!', { variant: 'success' });
        setSelectedConversationId(newConversationId);

        setCreateConversationMode(false);
      } catch (error) {
        enqueueSnackbar('Something went wrong, please try again', { variant: 'error' });
      }
    },
    [nirvanaUser, handleQuickDial, enqueueSnackbar, setCreateConversationMode],
  );

  const handleShowCreateConvoForm = useCallback(() => {
    setSelectedConversationId(undefined);
    setCreateConversationMode(true);
  }, [setCreateConversationMode, setSelectedConversationId]);

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | TERMINAL | ', rendersCount);

  const handleEscape = useCallback(() => {
    setCreateConversationMode(false);
    setSelectedConversationId(undefined);
  }, [setSelectedConversationId, setCreateConversationMode]);

  useKeyPressEvent('Escape', handleEscape);

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
        createConversationMode,
        handleShowCreateConvoForm,
        handleEscape,
        handleOmniSearch,
      }}
    >
      <Stack direction={'column'} sx={{ flex: 1 }}>
        <Grid container spacing={0} sx={{ flex: 1 }}>
          {/* side panel */}
          <Grid
            item
            xs={4}
            sx={{
              zIndex: 2,
              backgroundColor: blueGrey[50],
              boxShadow: 3,
              borderRight: `1px solid ${blueGrey}`,

              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Navbar
              searchVal={searchVal}
              isSearching={searching}
              handleChangeSearchInput={handleChangeSearchInput}
            />

            <Box sx={{ p: 2 }}>
              {searchVal ? (
                <ListPeople people={searchUsersResults} />
              ) : (
                <ConversationList
                  lookingForSomeone={selectedConversationId && !selectedConversation}
                />
              )}
            </Box>
          </Grid>

          <MainPanel />
        </Grid>

        <FooterControls />
      </Stack>

      {children}

      {/* create chat dialog */}
      <NewConversationDialog
        open={createConversationMode}
        handleSubmit={handleStartConversation}
        handleClose={handleEscape}
      />
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
        <Tooltip key={`${person.uid}-searchUsers`} title={'quick dial'}>
          <ListItem>
            <ListItemButton onClick={() => handleQuickDial(person)}>
              <ListItemAvatar>
                <Avatar alt={person.displayName} src={person.photoUrl} />
              </ListItemAvatar>
              <ListItemText primary={person.displayName} secondary={person.email} />

              <ListItemSecondaryAction sx={{ color: 'GrayText' }}>
                <FiZap />
              </ListItemSecondaryAction>
            </ListItemButton>
          </ListItem>
        </Tooltip>
      ))}
    </List>
  );
}

const maxPriorityConvos = 5;
