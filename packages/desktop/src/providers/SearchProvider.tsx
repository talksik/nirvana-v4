import React, { useCallback, useContext, useState } from 'react';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { ConversationMap } from '../util/types';
import { User } from '@nirvana/core/src/models/user.model';
import { searchUsers as firestoreSearchUsers } from '../firebase/firestore';
import useAuth from './AuthProvider';
import useConversations from './ConversationProvider';
import { useDebounce } from 'react-use';

interface ISearchContext {
  searchUsers?: (searchQuery: string) => void;
  omniSearch?: (searchQuery: string) => void;
  searchConversations?: (searchQuery: string) => void;

  conversationResults: Conversation[];
  userResults: User[];

  isSearching: boolean;

  // transparency into what our search is searching for
  searchQuery: string;
  clearSearch?: () => void;
}

const SearchContext = React.createContext<ISearchContext>({
  isSearching: false,
  conversationResults: [],
  userResults: [],
  searchQuery: '',
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { conversationMap } = useConversations();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [userResults, setUserResultsResults] = useState<User[]>([]);
  const [conversationResults, setConversationResultsResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // debounce user search and any other async ones
  const [, cancel] = useDebounce(
    async () => {
      if (searchQuery) {
        let results = await firestoreSearchUsers(searchQuery);
        results = results.filter((userResult) => userResult.id !== user.uid);
        setUserResultsResults(results);

        console.warn('searched users', results);
      }

      setIsSearching(false);
    },
    1000,
    [searchQuery, setUserResultsResults, user, setIsSearching],
  );

  // any view will hit this when they want and start the debounce process
  const searchUsers = useCallback(
    (searchQuery: string) => {
      setSearchQuery(searchQuery);
      setIsSearching(true);
    },
    [setSearchQuery, setIsSearching],
  );

  /**
   *
   * @param searchQuery
   * given a search query, finds conversations
   */

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

  const omniSearch = useCallback(
    async (searchQuery: string) => {
      searchQuery = searchQuery.replace('/', '');
      setSearchQuery(searchQuery);

      // user search
      setIsSearching(true);

      // client side conversation search
      const relevantConversations = await searchRelevantConversations(searchQuery);
      setConversationResultsResults(relevantConversations);
    },
    [setIsSearching, setSearchQuery, setConversationResultsResults, searchRelevantConversations],
  );

  const clearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  return (
    <SearchContext.Provider
      value={{
        isSearching,
        omniSearch,
        searchUsers,
        userResults,
        conversationResults,
        searchQuery,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export default function useSearch() {
  return useContext(SearchContext);
}
