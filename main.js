const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray,
  Menu
} = require('electron');
const path = require('path');
const url = require('url');
const AutoLaunch = require('auto-launch');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null;
let isBrowsing = false;
let dev = false;

const gitEasyAutoLauncher = new AutoLaunch({
  name: 'git-easy',
  isHidden: true,
  mac: {
    useLaunchAgent: true
  }
});

gitEasyAutoLauncher.isEnabled().then((enabled) => {
  if (enabled || process.env.NODE_ENV === 'development') return;
  gitEasyAutoLauncher.enable();
});

// TODO: emit a broader hide-window event
const hideWindow = () => {
  mainWindow.hide();
  mainWindow.webContents.send('clear-filter');
};

const showWindow = () => {
  if (!isBrowsing) {
    mainWindow.show();
  }
};
// Keep a reference for dev mode
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true;
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 450,
    show: false,
    skipTaskbar: true,
    frame: false,
    minHeight: 250,
    minWidth: 250
  });


  mainWindow.setMenu(null);

  // and load the index.html of the app.
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }

  mainWindow.loadURL(indexPath);

  mainWindow.on('blur', () => {
    if (!isBrowsing) {
      hideWindow();
    }
  });

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    // Open the DevTools automatically if developing
    if (dev) {
      // mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  // TODO: create proper enum helpers
  if (/^darwin/.test(process.platform)) {
    app.dock.hide();
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click() {
        showWindow();
      }
    },
    {
      label: 'Quit',
      click() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray = new Tray(path.join(__dirname, '/src/assets/images/icon.png'));
  tray.setToolTip('Git Easy');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('mark-as-browsing', (e, arg) => {
  isBrowsing = arg.isBrowsing;
  if (isBrowsing) {
    hideWindow();
  } else {
    showWindow();
  }
});

ipcMain.on('hide-main-window', () => {
  hideWindow();
});

ipcMain.on('register-shortcut-open', (_, shortcut) => {
    /* eslint-disable no-console */
  console.log('Global shortcut registered: ', shortcut);
  globalShortcut.register(shortcut, () => {
    showWindow();
  });
});
