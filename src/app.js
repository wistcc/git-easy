const { ipcRenderer } = require('electron');
const documentHelper = require('./helpers/document');
const Store = require('./core/store');
const storage = require('./helpers/storage');
const ui = require('./helpers/ui');
const consoles = require('./core/consoles');

const initialState = storage.getInitialState();

const store = new Store(initialState);

store.on('stateChanged', (newState, oldState) => {
    if (newState.lastConsole !== oldState.lastConsole) {
        storage.setLastConsole(newState.lastConsole);
    }

    if (newState.directoryFilter !== oldState.directoryFilter) {
        const regx = new RegExp(newState.directoryFilter, 'i');
        const filteredSubdirectories = newState.subdirectories.filter(s => regx.test(s.folder));

        this.setState({
            filteredSubdirectories,
        });

        ui.printFilter(newState.directoryFilter);
    }

    if (newState.subdirectories !== oldState.subdirectories) {
        this.setState({
            filteredSubdirectories: newState.subdirectories,
            directoryFilter: '',
        });
    }

    if (newState.directories !== oldState.directories) {
        ui.printSavedDirectories(newState.directories, newState.lastDirectory);
        storage.setDirectories(newState.directories);
    }

    if (newState.lastDirectory !== oldState.lastDirectory) {
        documentHelper.appendDirectories(newState.lastDirectory);
        storage.setLastDirectory(newState.lastDirectory);
        ui.printSavedDirectories(newState.directories, newState.lastDirectory);
    }

    if (newState.filteredSubdirectories !== oldState.filteredSubdirectories) {
        ui.printSubdirectories(newState.filteredSubdirectories);
    }
});

const { lastDirectory, directories, globalShortcut, lastConsole } = store.getState();

documentHelper.init(store);
documentHelper.appendDirectories(lastDirectory);
ui.printConsoles(consoles.get(), lastConsole);
ui.printSavedDirectories(directories, lastDirectory);

ipcRenderer.send('register-shortcut-open', globalShortcut);

if (process.env.NODE_ENV !== 'development') {
    documentHelper.checkForUpdates();
}
