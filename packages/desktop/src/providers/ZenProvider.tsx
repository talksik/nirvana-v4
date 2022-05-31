import React, { useCallback, useContext, useState } from 'react';

interface IZenContext {
  flowState: boolean;
  toggleFlowState?: () => void;

  hasSecretAccess: boolean;

  handleEscape?: () => void;
}

const ZenContext = React.createContext<IZenContext>({
  flowState: false,
  hasSecretAccess: false,
});

export function ZenProvider({ children }: { children: React.ReactNode }) {
  const [flowState, setFlowState] = useState<boolean>(false);
  const [hasSecretAccess, setHasSecretAccess] = useState<boolean>(false);

  const toggleFlowState = useCallback(() => {
    console.log('toggling flow state');
  }, []);

  return (
    <ZenContext.Provider value={{ toggleFlowState, hasSecretAccess, flowState }}>
      {children}
    </ZenContext.Provider>
  );
}

export default function useZen() {
  return useContext(ZenContext);
}
