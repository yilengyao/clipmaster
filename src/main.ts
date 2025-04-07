import { 
  app, 
  BrowserWindow,
  clipboard,
  globalShortcut,
  Menu,
  Tray,
  nativeTheme,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'node:path';

const clippings: string[] = [];
let tray: Tray | null = null;
const getIcon = () => {
  if (process.platform === 'win32') return '../src/icon-light@2x.icon';
  if (nativeTheme.shouldUseDarkColors) return '../src/icon-light.png';
  return 'icon-dark.png';
}
let browserWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Hide dock icon on macOS (for menu bar only apps)
  if (app.dock) app.dock.hide();

  // Create UI elements
  tray = new Tray(path.join(__dirname, getIcon()));
  tray.setPressedImage(path.join(__dirname, '../src/icon-light.png'));
  
  browserWindow = createWindow();

  // Configure UI elements (visual appearance)
  updateMenu();
  tray.setToolTip('Clipmaster');

  // Register global shortcuts
  const activationShortcut = globalShortcut.register('CommandOrControl+option+C', () => {
    tray?.popUpContextMenu();
  });

  if (!activationShortcut) {
    console.error('Activation shortcut registration failed');
  }

  // Register system event handlers (last, as they are for future events)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Configure UI elements
  if (process.platform === 'win32') {
    tray.on('click' as any, tray.popUpContextMenu);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const updateMenu = (): void => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Create New Clipping',
      click() { addClipping(); },
      accelerator: 'CommandOrControl+shift+C'
    },
    { type: 'separator' },
    ...clippings.slice(0, 10).map(createClippingMenuItem),
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => { app.quit(); },
      accelerator: 'CommandOrControl+Q',
    }    
  ]);

  tray?.setContextMenu(menu);
}

const addClipping = (): string | void => {
  const clipping = clipboard.readText();
  if (clippings.includes(clipping)) return;
  clippings.unshift(clipping);
  updateMenu();
  return clipping;
}

const createClippingMenuItem = (clipping: string, index: number): MenuItemConstructorOptions => {
  return {
    label: clipping.length > 20 ? clipping.slice(0, 20) + '...' : clipping,
    click() { clipboard.writeText(clipping); },
    accelerator: `CommandOrControl+${index}`,
  }
}