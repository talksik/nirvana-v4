import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useMediaDevices, useMount } from 'react-use';

import { useImmer } from 'use-immer';
import { useSnackbar } from 'notistack';

// device ids for different types of content
type DeviceSelections = { audio?: string; video?: string };

interface ICommunicationsContext {
  userLocalStream?: MediaStream;

  userDeviceSelections?: DeviceSelections;
}

const CommunicationsContext = React.createContext<ICommunicationsContext>({});

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

// todo save the selected devices in localstorage
export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [userDeviceSelections, setUserDeviceSelections] = useImmer<DeviceSelections>({});

  const devices = useUserDevices();

  // const getUserAudioDevices = useMemo(() => {
  //   console.log(devices);
  // }, [devices]);

  // useMount(getUserAudioDevices);

  return (
    <CommunicationsContext.Provider value={{ userDeviceSelections }}>
      {children}
    </CommunicationsContext.Provider>
  );
}

export default function useCommunications() {
  return useContext(CommunicationsContext);
}
