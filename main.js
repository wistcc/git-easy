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
const setupEvents = require('./src/installers/setupEvents');

setupEvents.handleSquirrelEvent();

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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null;
let isBrowsing = false;

const hideWindow = () => {
    mainWindow.hide();
    mainWindow.webContents.send('clear-filter');
};

const createWindow = () => {
  // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 350,
        height: 450,
        show: false,
        skipTaskbar: true,
        frame: false,
        resizable: false
    });

    mainWindow.setMenu(null);

  // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('blur', () => {
        if (!isBrowsing) {
            hideWindow();
        }
        isBrowsing = false;
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();

    if (/^darwin/.test(process.platform)) {
        app.dock.hide();
    }

    tray = new Tray(path.join(__dirname, '/src/assets/images/icon.png'));
    tray.setToolTip('Git Easy');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click() {
                mainWindow.show();
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
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.show();
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('mark-as-browsing', () => {
    isBrowsing = true;
});

ipcMain.on('hide-main-window', () => {
    hideWindow();
});

ipcMain.on('register-shortcut-open', (_, shortcut) => {
    /* eslint-disable no-console */
    console.log('Global shortcut registered: ', shortcut);
    globalShortcut.register(shortcut, () => {
        mainWindow.show();
    });
});
