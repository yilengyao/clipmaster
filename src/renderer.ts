declare interface IpcRendererEvent {
    sender: any;
    senderId: number;
    ports: MessagePort[];
}

window.electronAPI.on('show-notification', (event: IpcRendererEvent, title: string, body: string, onClick =() => {}) => {
   const myNotification: Notification = new Notification(title, { body });

   myNotification.onclick = onClick;
});