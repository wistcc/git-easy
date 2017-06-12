const documentHelper = require('./src/helpers/document');
const Store = require('./src/core/store');
const storage = require('./src/helpers/storage');

const initialState = storage.getInitialState();
initialState.directoryFilter = '';
initialState.subdirectories = [];

const store = new Store(initialState);

store.on('stateChanged', (newState, oldState) => {
    if(newState.directories !== oldState.directories)
        storage.setDirectories(newState.directories);

    if(newState.lastDirectory !== oldState.lastDirectory)
        storage.setLastDirectory(newState.lastDirectory);
    
    if(newState.lastConsole !== oldState.lastConsole)
        storage.setLastConsole(newState.lastConsole);
});

console.log('initial-state', store.getState());

documentHelper.init(store);
documentHelper.appendConsoles();
documentHelper.appendSavedDirectories();
