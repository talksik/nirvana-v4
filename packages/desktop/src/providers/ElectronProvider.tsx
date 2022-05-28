import React, { useContext, useEffect, useState, useCallback } from 'react';
import Channels, { DEFAULT_APP_PRESET, Dimensions } from '../electron/constants';

interface IElectronProvider {
  // pass handlers and current dimensions?
  desktopMode: DesktopMode;

  handleToggleDesktopMode?: () => void;

  isWindowFocused: boolean;
}

type DesktopMode = 'overlayOnly' | 'mainApp';

const ElectronContext = React.createContext<IElectronProvider>({
  desktopMode: 'mainApp',

  isWindowFocused: false,
});

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const [desktopMode, setDesktopMode] = useState<DesktopMode>('mainApp');
  const [isWindowFocused, setIsWindowFocused] = useState<boolean>(false);

  // handle all window resizing logic
  useEffect(() => {
    // add dimensions if it's not overlay only mode
    let finalDimensions: Dimensions = { height: 0, width: 0 };
    let finalPosition: 'center' | 'topRight';
    let stayOnTop: boolean;

    if (desktopMode === 'mainApp') {
      stayOnTop = false;
      finalDimensions = DEFAULT_APP_PRESET;
      finalPosition = 'center';
    } else if (desktopMode === 'overlayOnly') {
      stayOnTop = true;
      finalDimensions = {
        height: 273,
        width: 350,
      };
      finalPosition = 'topRight';
    }

    // send the final dimensions to main process
    window.electronAPI.window.resizeWindow({
      setAlwaysOnTop: stayOnTop,
      dimensions: {
        height: finalDimensions.height,
        width: finalDimensions.width,
      },
      setPosition: finalPosition,
      addDimensions: false,
    });
  }, [desktopMode]);

  // handle window focus and unfocus
  useEffect(() => {
    window.electronAPI.on(Channels.ON_WINDOW_BLUR, () => {
      console.log(
        'window blurring now, should be always on top and then ill tell main process to change dimensions',
      );
      setIsWindowFocused(false);

      // TODO: testing mode... uncomment both instructions below
      // setDesktopMode('overlayOnly');

      // todo: make sure that if I am toggle broadcasted into a line, then don't deselect selected line
      // the overlay should be showing selected line if I am broadcasting toggled into it as well as of course all other toggle tuned ones
      // setSelectedLineId(null);
    });

    window.electronAPI.on(Channels.ON_WINDOW_FOCUS, () => {
      console.log('window focusing now');
      setIsWindowFocused(true);
    });
  }, [setDesktopMode, setIsWindowFocused]);

  const handleToggleDesktopMode = useCallback(() => {
    setDesktopMode((prevMode) => (prevMode === 'mainApp' ? 'overlayOnly' : 'mainApp'));
  }, [setDesktopMode]);

  return (
    <ElectronContext.Provider value={{ desktopMode, handleToggleDesktopMode, isWindowFocused }}>
      {children}
    </ElectronContext.Provider>
  );
}

export default function useElectron() {
  return useContext(ElectronContext);
}
