import React, { useCallback } from 'react';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { ConversationMap } from './types';

/**
 *
 * @param searchQuery
 * given a search query, finds conversations
 */

export function useSearchConversations(conversationMap: ConversationMap) {
  const searchRelevantConversations = useCallback(
    async (searchQuery: string): Promise<Conversation[]> => {
      const relevantConversations: Conversation[] = [];

      Object.values(conversationMap).forEach((conversation) => {
        for (const cachedConversationUser of conversation.userCache) {
          if (
            cachedConversationUser.email
              .toLocaleLowerCase()
              .includes(searchQuery.toLocaleLowerCase())
          ) {
            relevantConversations.push(conversation);
            return;
          }

          if (
            cachedConversationUser.displayName
              .toLocaleLowerCase()
              .includes(searchQuery.toLocaleLowerCase())
          ) {
            relevantConversations.push(conversation);
            return;
          }
        }

        if (conversation.name?.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())) {
          relevantConversations.push(conversation);
          return;
        }
      });

      return relevantConversations;
    },
    [conversationMap],
  );

  return { searchRelevantConversations };
}
