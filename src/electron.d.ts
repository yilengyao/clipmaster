export interface ElectronAPI {
    // send: (channel: string, ...args: any[]) => void;
    on: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}