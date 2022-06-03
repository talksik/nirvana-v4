/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaDevices, useMount } from 'react-use';

import TwilioAccessToken from '@nirvana/core/src/functions/response/TwilioAccessToken.response';
import { getTwilioAccessToken } from '../firebase/functions';
import useConversations from './ConversationProvider';
import { useImmer } from 'use-immer';
import { useSnackbar } from 'notistack';

// device ids for different types of content
type DeviceSelections = { audio?: string; video?: string };

function useUserDevices() {
  const devices = useMemo(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('enumerateDevices() not supported.');
      return;
    }

    // List cameras and microphones.
    let mediaDeviceInfo: MediaDeviceInfo[] = [];

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log(device.kind + ': ' + device.label + ' id = ' + device.deviceId);
        });
        mediaDeviceInfo = devices;
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
      });

    return mediaDeviceInfo;
  }, []);

  const audioOutputDevices = useMemo(
    () => devices.filter((device) => device.kind === 'audiooutput') ?? [],
    [devices],
  );
  const audioInputDevices = useMemo(
    () => devices.filter((device) => device.kind === 'audioinput') ?? [],
    [devices],
  );
  const videoInputDevices = useMemo(
    () => devices.filter((device) => device.kind === 'videoinput') ?? [],
    [devices],
  );

  return { audioOutputDevices, audioInputDevices, videoInputDevices };
}

interface ICommunicationsContext {
  userLocalStream?: MediaStream;

  userDeviceSelections?: DeviceSelections;
}

const CommunicationsContext = React.createContext<ICommunicationsContext>({});

// todo save the selected devices in localstorage
export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [userDeviceSelections, setUserDeviceSelections] = useImmer<DeviceSelections>({});

  const { selectedConversation } = useConversations();

  const devices = useUserDevices();

  const localAudioRef = useRef<HTMLAudioElement>(null);

  const connectToRoom = useCallback(
    async (conversationId: string) => {
      try {
        console.log('hey');
      } catch (error) {
        console.error(error);
        enqueueSnackbar('something went wrong trying to set up calls', { variant: 'error' });
      }
    },
    [enqueueSnackbar],
  );

  // every time conversation is selected
  // we should connect to the room and get all of the participant peers
  // do a peer to peer room for all cases for now
  useEffect(() => {
    if (selectedConversation?.id) {
      connectToRoom(selectedConversation.id);
    } else {
      // leave room
    }
  }, [selectedConversation?.id, connectToRoom]);

  // const getUserAudioDevices = useMemo(() => {
  //   console.log(devices);
  // }, [devices]);

  // useMount(getUserAudioDevices);
  useMount(() => {
    console.log(navigator.connection);
  });

  return (
    <CommunicationsContext.Provider value={{ userDeviceSelections }}>
      {children}
    </CommunicationsContext.Provider>
  );
}

export default function useCommunications() {
  return useContext(CommunicationsContext);
}
