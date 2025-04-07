// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { on } from 'events';

contextBridge.exposeInMainWorld('electronAPI', {
    // IPC functions
    // send: (channel: string, ...args: any[]) => {
    //     // whitelist channels
    //     const validChannels = ['show-notification'];
    //     if (validChannels.includes(channel)) {
    //         ipcRenderer.send(channel, ...args);
    //     }
    // },
    on: (channel: string, callback: (...args: any[]) => void) => {
        // whitelist channels
        const validReceiveChannels = ['show-notification'];
        if (validReceiveChannels.includes(channel)) {
            // Remove existing listeners to avoid duplicates
            ipcRenderer.removeAllListeners(channel);
            // Add the new listener
            ipcRenderer.on(channel, (_, ...args) => callback(...args));
          }
    }
});