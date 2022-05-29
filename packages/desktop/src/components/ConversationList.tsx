import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  ListItemSecondaryAction,
  AvatarGroup,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { FiActivity, FiInbox, FiSearch, FiUsers, FiCoffee, FiCircle } from 'react-icons/fi';
import NirvanaAvatar from './NirvanaAvatar';
import { useDebounce, useKey } from 'react-use';
import { useSnackbar } from 'notistack';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { searchUsers } from '../firebase/firestore';
import { User } from '@nirvana/core/src/models/user.model';
import useTerminal from './Terminal';
import Conversation from '@nirvana/core/src/models/conversation.model';
import useAuth from '../providers/AuthProvider';
import { useImmer } from 'use-immer';

/**
 *
 * @param lookingForSomeone: if a conversation id has been selected and we are looking for it
 * @returns
 */
export function ConversationList({ lookingForSomeone = false }: { lookingForSomeone: boolean }) {
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
