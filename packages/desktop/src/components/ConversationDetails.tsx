import {
  Avatar,
  AvatarGroup,
  Box,
  Container,
  Fab,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FiCloudRain, FiMoreVertical, FiPlay, FiSun } from 'react-icons/fi';
import React, { useEffect, useMemo, useState } from 'react';
import { joinConversation, leaveConversation } from '../firebase/firestore';

import ConversationLabel from '../subcomponents/ConversationLabel';
import { User } from '@nirvana/core/src/models/user.model';
/* eslint-disable jsx-a11y/media-has-caption */
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import { useImmer } from 'use-immer';
import { useRendersCount } from 'react-use';
import useTerminal from './Terminal';

/**
 * nice convo history
 * - chunk has max of 1 minute
 * - put current clip in next chunk if previous clip was more than 4 hours ago
 * - put current clip in next chunk if it's after my last active date here
 */

export default function ConversationDetails() {
  const { user } = useAuth();
  const { getUser, selectedConversation, selectConversation, isCloudDoingMagic } = useTerminal();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION DETAILS | ', rendersCount);

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

    const handleCloseWindow = (event: BeforeUnloadEvent): Promise<void> => {
      leaveConversation(selectedConversation.id, user.uid);

      return;
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

  return (
    <>
      <Container maxWidth={false} sx={{ position: 'relative', flex: 1, overflow: 'auto' }}>
        <ConversationHistory />

        {/* <Box
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
        </Box> */}
      </Container>
    </>
  );
}

function ConversationHistory() {
  const { isCloudDoingMagic, selectedConversation, conversationContentMap } = useTerminal();

  const contentBlocks = useMemo(() => {
    return conversationContentMap[selectedConversation.id] ?? [];
  }, [conversationContentMap, selectedConversation.id]);

  return (
    <Container maxWidth="xs">
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

              <audio controls src={contentBlock.contentUrl} />

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
