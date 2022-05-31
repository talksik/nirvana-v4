import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { ConversationRow } from './ConversationList';
import { FiZap } from 'react-icons/fi';
import React from 'react';
import { User } from '@nirvana/core/src/models/user.model';
import useConversations from '../providers/ConversationProvider';
import useSearch from '../providers/SearchProvider';
import useTerminal from './Terminal';

export default function OmniSearchResults() {
  const { handleQuickDial } = useTerminal();
  const { selectConversation } = useConversations();

  const { userResults: people, conversationResults: conversations } = useSearch();

  return (
    <>
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
              People
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
              Conversations
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
          {conversations.length === 0 && (
            <Typography align="center" variant="caption">
              {`Can't find a conversation? Just create one!`}
            </Typography>
          )}
        </ListItem>

        {conversations.map((conversation) => (
          <Tooltip key={`${conversation.id}-searchConversations`} title={'continue conversation'}>
            <ConversationRow conversation={conversation} />
          </Tooltip>
        ))}
      </List>
    </>
  );
}
