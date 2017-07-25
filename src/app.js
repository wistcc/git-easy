const { ipcRenderer } = require('electron');
const documentHelper = require('./src/helpers/document');
const Store = require('./src/core/store');
const storage = require('./src/helpers/storage');
const ui = require('./src/helpers/ui');
const consoles = require('./src/core/consoles');

const initialState = storage.getInitialState();

const store = new Store(initialState);

store.on('stateChanged', (newState, oldState) => {
    if (newState.lastConsole !== oldState.lastConsole) {
        storage.setLastConsole(newState.lastConsole);
    }

    if (newState.directoryFilter !== oldState.directoryFilter) {
        const regx = new RegExp(newState.directoryFilter, 'i');
        const filteredSubdirectories = newState.subdirectories.filter(s => regx.test(s.folder));

        store.setState({
            filteredSubdirectories,
            selectedSubdirectory: null
        });

        ui.printFilter(newState.directoryFilter);
    }

    if (newState.subdirectories !== oldState.subdirectories) {
        store.setState({
            filteredSubdirectories: newState.subdirectories,
            directoryFilter: '',
            selectedSubdirectory: null
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

    if (newState.selectedPanel !== oldState.selectedPanel) {
        if (newState.selectedPanel === 'consoles') {
            ui.printConsoles(consoles.get(), newState.lastConsole);
        } else if (newState.selectedPanel === 'directories') {
            ui.printSavedDirectories(newState.directories, newState.lastDirectory);
        }
    }

    if (newState.modalActive !== oldState.modalActive) {
        ui.toggleModal(newState.modalActive);
    }

    if (newState.selectedSubdirectory !== oldState.selectedSubdirectory) {
        if (newState.selectedSubdirectory !== null) {
            documentHelper.selectSubdirectory();
        } else {
            documentHelper.deselectSubdirectory();
        }
    }
});

const { lastDirectory, globalShortcut } = store.getState();

documentHelper.init(store);
ui.init(store);
documentHelper.appendDirectories(lastDirectory);

ipcRenderer.send('register-shortcut-open', globalShortcut);

if (process.env.NODE_ENV !== 'development') {
    documentHelper.checkForUpdates();
}
