import Channels, { Dimensions, STORE_ITEMS } from './constants';
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  auth: {
    initiateLogin() {
      ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    },
  },
  store: {
    get(val: STORE_ITEMS) {
      return ipcRenderer.invoke('electron-store-get', val);
    },
    set(property: STORE_ITEMS, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },

  window: {
    resizeWindow(newDimensions: Dimensions) {
      ipcRenderer.send(Channels.RESIZE_WINDOW, newDimensions);
    },
  },

  send(channel: Channels, data?: any) {
    ipcRenderer.send(channel, data);
  },

  on(channel: Channels, func: any) {
    // const validChannels = ['ipc-example'];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.on(channel, (event, ...args) => func(...args));
    // }

    ipcRenderer.on(channel, (event, ...args) => func(...args));
    return () => ipcRenderer.removeAllListeners(channel);
  },
  once(channel: Channels, func: any) {
    // const validChannels = ["ipc-example"];
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.once(channel, (event, ...args) => func(...args));
    // }

    ipcRenderer.once(channel, (event, ...args) => func(...args));

    return () => ipcRenderer.removeAllListeners(channel);
  },
  removeListener(channel: Channels) {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export default electronAPI;
