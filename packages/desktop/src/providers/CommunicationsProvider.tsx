import React, { useContext, useEffect } from 'react';

import { useImmer } from 'use-immer';

// device ids for different types of content
type DeviceSelections = { audio?: string; video?: string };

interface ICommunicationsContext {
  userLocalStream?: MediaStream;

  userDeviceSelections?: DeviceSelections;
}

const CommunicationsContext = React.createContext<ICommunicationsContext>({});

export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const [userDeviceSelections, setUserDeviceSelections] = useImmer<DeviceSelections>({});

  // todo save the selected devices in localstorage

  useEffect(() => {}, []);

  return (
    <CommunicationsContext.Provider value={{ userDeviceSelections }}>
      {children}
    </CommunicationsContext.Provider>
  );
}

export default function useCommunications() {
  return useContext(CommunicationsContext);
}
