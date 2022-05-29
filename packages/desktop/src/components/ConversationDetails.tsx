/* eslint-disable jsx-a11y/media-has-caption */
import { blueGrey } from '@mui/material/colors';
import React, { useState, useEffect, useMemo } from 'react';
import { joinConversation, leaveConversation } from '../firebase/firestore';
import useAuth from '../providers/AuthProvider';
import { useImmer } from 'use-immer';
import useTerminal from './Terminal';
import { User } from '@nirvana/core/src/models/user.model';
import {
  Stack,
  IconButton,
  Typography,
  AvatarGroup,
  Avatar,
  Box,
  Container,
  Fab,
  Paper,
} from '@mui/material';
import { FiSun, FiMoreVertical, FiPlay, FiCloudRain } from 'react-icons/fi';

export default function ConversationDetails() {
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

      <Container maxWidth={false} sx={{ position: 'relative', flex: 1, overflow: 'auto' }}>
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
