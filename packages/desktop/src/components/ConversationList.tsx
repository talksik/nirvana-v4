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
import React, { useCallback } from 'react';

import Conversation from '@nirvana/core/src/models/conversation.model';
import ConversationLabel from '../subcomponents/ConversationLabel';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import useAuth from '../providers/AuthProvider';
import { useRendersCount } from 'react-use';
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

        {Object.values(conversationMap).map((currentConversation) => (
          <ConversationRow
            key={`${currentConversation.id}-priorityConvoList`}
            conversation={currentConversation}
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

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const { getUser, selectedConversation, selectConversation } = useTerminal();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION LIST ROW | ', rendersCount);

  return (
    <ListItem key={`${conversation.id}-priorityConvoList`}>
      <ListItemButton
        selected={selectedConversation?.id === conversation.id}
        onClick={() => selectConversation(conversation.id)}
      >
        {conversation.membersInRoom?.length > 0 ? (
          <IconButton color="primary" size="small">
            <FiSun />
          </IconButton>
        ) : (
          <Box sx={{ color: 'GrayText', fontSize: 10, ml: 0 }}>
            <FiCircle />
          </Box>
        )}

        <Box sx={{ ml: 2, mr: 'auto', color: 'GrayText' }}>
          <ConversationLabel
            users={conversation.userCache ?? []}
            conversationName={conversation.name}
            isSelected={selectedConversation?.id === conversation.id}
          />
        </Box>

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
