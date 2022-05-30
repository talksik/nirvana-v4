import React, { useEffect } from 'react';

import Conversation from '@nirvana/core/src/models/conversation.model';
import { useMediaDevices } from 'react-use';

export default function useStreamHandler(selectedConversation: Conversation) {
  const devices = useMediaDevices();

  console.log('devices');

  console.log(devices);

  useEffect(() => {
    if (selectedConversation) {
      console.log('handle stream for this newly selected conversation');
    }
  }, [selectedConversation]);
}
