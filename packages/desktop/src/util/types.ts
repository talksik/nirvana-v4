import { ContentBlock } from '@nirvana/core/src/models/content.model';
import Conversation from '@nirvana/core/src/models/conversation.model';
import { User } from '@nirvana/core/src/models/user.model';

export type ConversationMap = {
  [conversationId: string]: Conversation;
};

export type UserMap = {
  [userId: string]: User;
};

export type ConversationContentMap = {
  [conversationId: string]: ContentBlock[];
};
