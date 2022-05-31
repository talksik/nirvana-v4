import { ConversationContentMap, ConversationMap, UserMap } from '../util/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Unsubscribe, onSnapshot } from 'firebase/firestore';
import {
  getConversationContentQueryLIVE,
  getConversationsQueryLIVE,
  getUserById,
} from '../firebase/firestore';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { User } from '@nirvana/core/src/models/user.model';
import useAuth from './AuthProvider';
import { useImmer } from 'use-immer';
import { useSnackbar } from 'notistack';
import { useUnmount } from 'react-use';

interface IConversationContext {
  conversationMap: ConversationMap;
  conversationContentMap: ConversationContentMap;

  selectedConversation?: Conversation;
  selectConversation?: (conversationId: string) => void;

  getUser?: (userId: string) => Promise<User | undefined>;
}

const ConversationContext = React.createContext<IConversationContext>({
  conversationContentMap: {},
  conversationMap: {},
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuth();

  const [selectedConversationId, setSelectedConversationId] = useState<string>(undefined);

  const [conversationMap, updateConversationMap] = useImmer<ConversationMap>({});
  const [userMap, updateUserMap] = useImmer<UserMap>({});
  const [conversationContentMap, updateContentMap] = useImmer<ConversationContentMap>({});

  const [contentListeners, setContentListeners] = useImmer<{
    [conversationId: string]: Unsubscribe;
  }>({});

  const addConversationContentListener = useCallback(
    (conversationId: string) => {
      // ?optimization
      // ? only start listening to conversation content where it is in my priority box?
      // ? all other conversations, just fetch periodically?

      // TODO: future work/optimization
      // if we removed a conversation, unsubscribe from content listener as well

      setContentListeners((draftListeners) => {
        // if we have a listener for conversation already, then just move on
        if (draftListeners[conversationId]) return;

        // if we don't, then create one for this conversation
        const contentListener = onSnapshot(
          getConversationContentQueryLIVE(conversationId),
          (querySnapshot) => {
            querySnapshot.docChanges().forEach((docChange) => {
              const currentContentBlock = docChange.doc.data();

              if (docChange.type === 'added') {
                // TODO: add to audio queue from here if there was an addition?
                updateContentMap((draftContent) => {
                  if (draftContent[conversationId]) {
                    draftContent[conversationId].push(currentContentBlock);
                  } else {
                    draftContent[conversationId] = [currentContentBlock];
                  }
                });
              }
              if (docChange.type === 'modified') {
                //
              }
              if (docChange.type === 'removed') {
                //
              }
            });
          },
        );

        //add to map of listeners
        draftListeners[conversationId] = contentListener;
      });
    },
    [setContentListeners, updateContentMap],
  );
  // on unmount, get rid of all content listeners
  useUnmount(() => {
    Object.values(contentListeners).forEach((unsub) => unsub());
  });

  // fetch conversations
  useEffect(() => {
    const unsub = onSnapshot(getConversationsQueryLIVE(user.uid), (querySnapshot) => {
      updateConversationMap((draft) => {
        querySnapshot.docChanges().forEach((docChange) => {
          const currentConversation = docChange.doc.data();

          if (docChange.type === 'added') {
            console.log('New conversation: ', currentConversation);
            draft[currentConversation.id] = currentConversation;

            addConversationContentListener(currentConversation.id);
          }
          if (docChange.type === 'modified') {
            console.log('Modified conversation: ', currentConversation);
            draft[currentConversation.id] = currentConversation;
          }
          if (docChange.type === 'removed') {
            console.log('Removed conversation: ', currentConversation);
            delete draft[currentConversation.id];
          }
        });
      });
    });

    return () => unsub();
  }, [user, updateConversationMap, enqueueSnackbar, addConversationContentListener]);

  const getUser = useCallback(
    async (userId: string) => {
      if (userMap[userId]) return userMap[userId];

      const fetchedUser = await getUserById(userId);

      updateUserMap((draft) => {
        draft[userId] = fetchedUser;
      });

      return fetchedUser;
    },
    [userMap, updateUserMap],
  );

  // cache of selected conversation
  const selectedConversation: Conversation | undefined = useMemo(() => {
    if (!selectedConversationId) return undefined;

    // select if we do have it

    const conversation = conversationMap[selectedConversationId];

    if (!conversation) {
      enqueueSnackbar('no conversation found', { variant: 'error' });
      console.error('Should have found it... maybe retry once more');
    }

    return conversation;

    // get conversation if not here
    // const fetchedConversation = await getConversationById

    // return undefined;
  }, [selectedConversationId, conversationMap, enqueueSnackbar]);

  const selectConversation = useCallback(
    (conversationId: string) => setSelectedConversationId(conversationId),
    [setSelectedConversationId],
  );

  return (
    <ConversationContext.Provider
      value={{
        conversationMap,
        conversationContentMap,
        selectedConversation,
        selectConversation,
        getUser,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export default function useConversations() {
  return useContext(ConversationContext);
}
