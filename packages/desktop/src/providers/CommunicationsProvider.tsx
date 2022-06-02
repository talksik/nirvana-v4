/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-no-comment-textnodes */
import { ConnectOptions, Room, connect } from 'twilio-video';
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

  room: Room | null;
}

const CommunicationsContext = React.createContext<ICommunicationsContext>({
  room: null,
});

// todo save the selected devices in localstorage
export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [userDeviceSelections, setUserDeviceSelections] = useImmer<DeviceSelections>({});

  const { selectedConversation } = useConversations();

  const devices = useUserDevices();

  const [room, setRoom] = useState<Room | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);

  const getAuthToken = useCallback(async () => {
    const result = await getTwilioAccessToken();
    const data = result.data as TwilioAccessToken;

    enqueueSnackbar('got token data');

    return data.token;
  }, [enqueueSnackbar]);

  const connectToRoom = useCallback(
    async (conversationId: string) => {
      try {
        const token = await getAuthToken();

        connect(token, {
          name: conversationId,
          audio: true,
        }).then(
          (room) => {
            enqueueSnackbar('joined room', { variant: 'success' });

            // Log your Client's LocalParticipant in the Room
            const localParticipant = room.localParticipant;
            console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

            // Log any Participants already connected to the Room
            room.participants.forEach((participant) => {
              console.log(`Participant "${participant.identity}" is connected to the Room`);
            });

            // Log new Participants as they connect to the Room
            room.once('participantConnected', (participant) => {
              console.log(`Participant "${participant.identity}" has connected to the Room`);
            });

            // Log Participants as they disconnect from the Room
            room.once('participantDisconnected', (participant) => {
              console.log(`Participant "${participant.identity}" has disconnected from the Room`);
            });

            setRoom(room);
          },
          (error) => {
            console.error(`Unable to connect to Room: ${error.message}`);
          },
        );
      } catch (error) {
        console.error(error);
        enqueueSnackbar('something went wrong trying to set up calls', { variant: 'error' });
      }
    },
    [getAuthToken, enqueueSnackbar, setRoom],
  );

  // every time conversation is selected
  // we should connect to the room and get all of the participant peers
  // do a peer to peer room for all cases for now
  useEffect(() => {
    if (selectedConversation?.id) {
      connectToRoom(selectedConversation.id);
    } else {
      // leave room

      setRoom(null);
    }
  }, [selectedConversation?.id, connectToRoom]);

  // const getUserAudioDevices = useMemo(() => {
  //   console.log(devices);
  // }, [devices]);

  // useMount(getUserAudioDevices);
  useMount(() => {
    fetch('https://ui-avatars.com/api/?name=John+Doe')
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  return (
    <CommunicationsContext.Provider value={{ userDeviceSelections, room }}>
      <audio autoPlay controls ref={localAudioRef} />

      {children}
    </CommunicationsContext.Provider>
  );
}

export default function useCommunications() {
  return useContext(CommunicationsContext);
}
