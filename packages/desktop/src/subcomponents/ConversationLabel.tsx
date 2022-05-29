import React from 'react';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { User } from '@nirvana/core/src/models/user.model';
import { Typography } from '@mui/material';
import useAuth from '../providers/AuthProvider';

type IConversationLabel =
  | {
      conversationName?: string;
      users: User[];
    }
  | {
      conversationName: string;
      users?: User[];
    };

/**
 * if there is a name in the conversation, then return that
 * if not, then return first three names
 */
export default function ConversationLabel({ conversationName, users }: IConversationLabel) {
  const { user } = useAuth();

  if (conversationName) {
    return <Typography variant="overline">{conversationName}</Typography>;
  }

  const filteredUsers = users.filter((convoUser) => convoUser.id !== user.uid);

  if (filteredUsers.length === 1) {
    const firstName = filteredUsers[0].displayName.split(' ')[0];

    return <Typography variant="overline">{firstName}</Typography>;
  }

  if (filteredUsers.length > 1) {
    const firstNames = filteredUsers.map((filteredUser) => filteredUser.displayName.split(' ')[0]);

    const formattedFirstnames = firstNames.slice(0, -1).join(',') + ' and ' + firstNames.slice(-1);

    return <Typography variant="overline">{formattedFirstnames}</Typography>;
  }

  return;
}
