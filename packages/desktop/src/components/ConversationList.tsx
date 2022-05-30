import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material';
import { FiActivity, FiCircle, FiSun } from 'react-icons/fi';
import React, { useCallback, useMemo } from 'react';
import { useKeyPressEvent, useRendersCount } from 'react-use';

import Conversation from '@nirvana/core/src/models/conversation.model';
import ConversationLabel from '../subcomponents/ConversationLabel';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import useAuth from '../providers/AuthProvider';
import useTerminal from './Terminal';

// sort conversations based on the different data sources: type, conversations, audio clips, etc.

/**
 *
 * @param lookingForSomeone: if a conversation id has been selected and we are looking for it
 * @returns
 */
export function ConversationList({ lookingForSomeone = false }: { lookingForSomeone: boolean }) {
  const { conversationMap, handleOmniSearch } = useTerminal();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION LIST | ', rendersCount);

  const handleQuickDialSupport = useCallback(() => {
    handleOmniSearch(SUPPORT_DISPLAY_NAME);
  }, [handleOmniSearch]);

  if (Object.keys(conversationMap).length === 0) {
    return (
      <Stack direction={'column'} alignItems="center">
        <Typography align="center" variant="caption">
          Look for someone by name or email to start a conversation!
        </Typography>

        <Divider />

        <Button onClick={handleQuickDialSupport} variant={'text'}>
          Click here to say hi to our team!
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <List
        subheader={
          <ListSubheader>
            <FiActivity />
            <Typography variant="subtitle2"> Priority</Typography>
          </ListSubheader>
        }
      >
        {lookingForSomeone && <CircularProgress />}

        {Object.values(conversationMap).map((currentConversation, index) => (
          <ConversationRow
            key={`${currentConversation.id}-priorityConvoList`}
            conversation={currentConversation}
            index={index}
          />
        ))}
      </List>

      {/* <Divider /> */}

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

/**
 *
 * @param index is used for keyboard shortcut if this convo row is in a list
 * @returns
 */
export function ConversationRow({
  conversation,
  index,
}: {
  conversation: Conversation;
  index?: number;
}) {
  const { user } = useAuth();
  const { getUser, selectedConversation, selectConversation } = useTerminal();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION LIST ROW | ', rendersCount);

  const keyboardShortcut = useMemo(() => {
    if (index < 9) {
      return index + 1;
    }

    return undefined;
  }, [index]);

  const handleSelectConversation = useCallback(() => {
    selectConversation(conversation.id);
  }, [conversation.id, selectConversation]);

  useKeyPressEvent(`${keyboardShortcut?.toString()}`, handleSelectConversation);

  return (
    <ListItem>
      <ListItemButton
        selected={selectedConversation?.id === conversation.id}
        onClick={handleSelectConversation}
      >
        {conversation.membersInRoom?.length > 0 ? (
          <Box sx={{ color: 'primary.main', fontSize: 15, ml: 0 }}>
            <FiSun />
          </Box>
        ) : (
          <Box sx={{ color: 'GrayText', fontSize: 10, ml: 0 }}>
            <FiCircle />
          </Box>
        )}

        <Stack direction={'row'} spacing={1} sx={{ ml: 2, mr: 'auto', color: 'GrayText' }}>
          {keyboardShortcut && <KeyboardShortcutLabel label={keyboardShortcut.toString()} />}
          <ConversationLabel
            users={conversation.userCache ?? []}
            conversationName={conversation.name}
            isSelected={selectedConversation?.id === conversation.id}
          />
        </Stack>

        <ListItemAvatar>
          <AvatarGroup variant={'rounded'}>
            {conversation.userCache?.map((conversationUser, index) => (
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
