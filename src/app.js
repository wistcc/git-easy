const documentHelper = require('./src/helpers/document');
const Store = require('./src/core/store');
const storage = require('./src/helpers/storage');
const ui = require('./src/helpers/ui');
const consoles = require('./src/core/consoles');

const initialState = storage.getInitialState();

const store = new Store(initialState);

store.on('stateChanged', function(newState, oldState) {
    if(newState.lastConsole !== oldState.lastConsole)
        storage.setLastConsole(newState.lastConsole);

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
    }

    if (newState.filteredSubdirectories !== oldState.filteredSubdirectories)
        ui.printSubdirectories(newState.filteredSubdirectories);
});

const { lastDirectory, directories } = store.getState();

documentHelper.init(store);
documentHelper.appendDirectories(lastDirectory);
ui.printConsoles(consoles.get());
ui.printSavedDirectories(directories, lastDirectory);

if (process.env.NODE_ENV !== 'development') {
    documentHelper.checkForUpdates();
}
