import { Box, Grid, Stack } from '@mui/material';
import { ContentBlock, ContentType } from '@nirvana/core/src/models/content.model';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createOneOnOneConversation, sendContentBlockToConversation } from '../firebase/firestore';
import { useKeyPressEvent, useRendersCount } from 'react-use';

import { ConversationList } from './ConversationList';
import FooterControls from './FooterControls';
import { KeyboardShortcuts } from '../util/keyboard';
import MainPanel from './MainPanel';
import Navbar from './Navbar';
import NewConversationDialog from './NewConversationDialog';
import OmniSearchResults from './OmniSearchResults';
import { User } from '@nirvana/core/src/models/user.model';
import { blueGrey } from '@mui/material/colors';
import { createGroupConversation } from '../firebase/firestore';
import { uploadAudioClip } from '../firebase/firebaseStorage';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import useSearch from '../providers/SearchProvider';
import { useSnackbar } from 'notistack';

interface ITerminalContext {
  handleQuickDial?: (otherUser: User) => void;

  isUserSpeaking: boolean;
  isCloudDoingMagic: boolean;

  createConversationMode: boolean;
  handleShowCreateConvoForm?: () => void;

  handleEscape?: () => void;

  handleOmniSearch?: (searchQuery: string) => void; // handle searching for anything globally
}

const TerminalContext = React.createContext<ITerminalContext>({
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

export function TerminalProvider({ children }: { children?: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, logout, nirvanaUser } = useAuth();

  const { conversationMap, conversationContentMap, selectConversation, selectedConversation } =
    useConversations();

  const { clearSearch, searchQuery } = useSearch();

  // handle create or open existing conversation
  // not 100% consistent to the second, but still works...don't need atomicity
  const handleQuickDial = useCallback(
    async (otherUser: User) => {
      clearSearch();

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
          selectConversation(findExistingConversation.id);
          return;
        }

        // create conversation in this case
        const newConversationId = await createOneOnOneConversation(otherUser, nirvanaUser);
        selectConversation(newConversationId);
      } catch (error) {
        enqueueSnackbar('Something went wrong, please try again', { variant: 'error' });
      }
    },
    [conversationMap, enqueueSnackbar, nirvanaUser, selectConversation, clearSearch],
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
        console.log('not active', localUserMedia);

        // !remove and try workarounds as provided by tushar from 100ms
        // localUserMedia.getTracks().forEach((track) => track.stop());

        setUserAudioStream(localUserMedia);

        const userMediaRecoder = new MediaRecorder(localUserMedia);
        setMediaRecorder(userMediaRecoder);
        userMediaRecoder.ondataavailable = handleMediaRecorderData;
        userMediaRecoder.onstop = handleOnStopRecording;
        userMediaRecoder.onstart = handleOnStartRecording;

        enqueueSnackbar('got mic');
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

      // actually stop talking after 2 seconds to capture everything
      setTimeout(() => {
        mediaRecorder.stop();
      }, 200);
    }
  }, [setIsUserSpeaking, isUserSpeaking, mediaRecorder]);

  useKeyPressEvent('`', handleBroadcast, handleStopBroadcast);

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
        selectConversation(newConversationId);

        setCreateConversationMode(false);
      } catch (error) {
        enqueueSnackbar('Something went wrong, please try again', { variant: 'error' });
      }
    },
    [nirvanaUser, handleQuickDial, enqueueSnackbar, setCreateConversationMode, selectConversation],
  );

  const handleShowCreateConvoForm = useCallback(() => {
    selectConversation(undefined);
    setCreateConversationMode(true);
  }, [setCreateConversationMode, selectConversation]);

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | TERMINAL | ', rendersCount);

  const handleEscape = useCallback(() => {
    setCreateConversationMode(false);
    selectConversation(undefined);
    clearSearch();
  }, [selectConversation, setCreateConversationMode, clearSearch]);

  useKeyPressEvent(KeyboardShortcuts.escape.shortcutKey, handleEscape);

  return (
    <TerminalContext.Provider
      value={{
        isUserSpeaking,
        handleQuickDial,
        isCloudDoingMagic,
        createConversationMode,
        handleShowCreateConvoForm,
        handleEscape,
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
            <Navbar />

            <Box sx={{ p: 2 }}>{searchQuery ? <OmniSearchResults /> : <ConversationList />}</Box>
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
