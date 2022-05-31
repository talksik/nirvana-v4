import { ConversationContentMap, ConversationMap } from '../util/types';

import React from 'react';

interface IConversationContext {
  conversationMap: ConversationMap;
  conversationContentMap: ConversationContentMap;
}

const ConversationContext = React.createContext<IConversationContext>({
  conversationContentMap: {},
  conversationMap: {},
});
