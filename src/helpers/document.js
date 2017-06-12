const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const command = require('../core/command');
const consoles = require('../core/consoles');

const $savedDirectories = document.getElementById('savedDirectories');
const $consoleList = document.getElementById('consoleList');
const $filter = document.getElementById('filter');

let store = {};

const init = (localStore) => {
    const removeButton = document.getElementById('removeButton');
    const browseButton = document.getElementById('browseButton');

    store = localStore;

    const { lastDirectory, directories } = store.getState();

    store.on('stateChanged', (newState, oldState) => {
        if(newState.directoryFilter !== oldState.directoryFilter){
            $filter.innerHTML = newState.directoryFilter;
            printSubdirectories();
        }

        if(newState.subdirectories !== oldState.subdirectories)
            documentHelper.printSubdirectories();
    });

    $consoleList.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        store.setState({ lastConsole: option });
    });

    $savedDirectories.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        store.setState({ lastDirectory: option });        
        appendDirectories(option);
    });

    removeButton.addEventListener("click", () => {
        let currentDirectories = directories.splice($savedDirectories.selectedIndex, 1);
        store.setState({ 
            lastDirectory: currentDirectories[0],
            directories: currentDirectories,           
        });                
        appendDirectories(currentDirectories[0]);
        appendSavedDirectories();
    });

    browseButton.addEventListener("click", () => {
        ipcRenderer.send('mark-as-browsing');
        const paths = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (paths) {
            store.setState({ directories: directories.concat([paths[0]]), lastDirectory: paths[0] });
            appendDirectories(paths[0]);
            appendSavedDirectories();
        }
    });

    document.onkeyup = function (e) {
        const { subdirectories } = store.getState();        
        let { directoryFilter } = store.getState();        

        const key = Number(e.key);
        if (key >= 0) {
            const con = $consoleList.options[$consoleList.selectedIndex].value;
            const sub = getFilteredSubdirectories(subdirectories, directoryFilter)[key];
            command.exec(path.join(sub.root, sub.folder), con);
        }

        //Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }

        //Backspace was pressed
        if (e.keyCode === 8)
            store.setState({directoryFilter: directoryFilter.slice(0, -1)})

        // Any a-z letter was pressed
        if (/^[A-Z]$/i.test(e.key))
            store.setState({directoryFilter: directoryFilter += e.key});
    };

    appendDirectories(lastDirectory);
};

const appendDirectories = (directory) => {
    if (!directory) {
        return;
    }

    const allSubDirectories = fs.readdirSync(directory);
    const currentSubDirectories = allSubDirectories.filter(file => {
        const currentPath = path.join(directory, file);
        return fs.lstatSync(currentPath).isDirectory() &&
            fs.readdirSync(currentPath).includes(".git");
    });

    if (allSubDirectories.includes(".git"))
        currentSubDirectories.push(directory);

    const subdirectories = currentSubDirectories.map(s => ({
        root: directory,
        folder: s,
    }));

    store.setState({subdirectories})
};

const addSubDirectoryButton = (rootElement, name, directory, buttonIndex) => {
    const button = document.createElement('button');
    const innerHTML = buttonIndex >= 0 ? `${buttonIndex}- ${name}` : name;

    button.innerHTML = innerHTML;
    button.className = 'directoryButton';
    button.setAttribute('data-path', directory);

    button.addEventListener("click", (e) => {
        const con = $consoleList.options[list.selectedIndex].value;

        command.exec(e.srcElement.getAttribute('data-path'), con);
    });

    rootElement.appendChild(button);
};

const printSubdirectories = () => {
    const { directoryFilter, subdirectories } = store.getState();
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    getFilteredSubdirectories(subdirectories, directoryFilter)
        .forEach((s, i) => {
            const currentPath = `${s.root}/${s.folder}`;
            addSubDirectoryButton(directoryList, s.folder, currentPath, i < 10 ? i : -1);
        });
}

const appendSavedDirectories = () => {
    while ($savedDirectories.hasChildNodes()) {
        $savedDirectories.removeChild(savedDirectories.lastChild);
    }

    const { directories, lastDirectory } = store.getState();
    directories.forEach(directory => {
        const option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;

        if (lastDirectory && lastDirectory === directory) {
            option.selected = true;
        }

        $savedDirectories.appendChild(option);
    });
};

const appendConsoles = () => {
    const defaultConsoles = consoles.get();
    const { lastConsole } = store.getState();    

    for (con in defaultConsoles) {
        var option = document.createElement('option');
        option.value = con;
        option.innerHTML = con;

        if (lastConsole && lastConsole === con) {
            option.selected = true;
        }

        consoleList.appendChild(option);
    }
};

const getFilteredSubdirectories = (sub, filter) => {
    const regx = new RegExp(filter, 'i');
    return sub.filter(s => regx.test(s.folder));
}

// When main-window is hidden, reset filter
ipcRenderer.on('clear-filter', () => {
    store.setState({directoryFilter: ''});
});

module.exports = {
    init,
    appendConsoles,
    appendSavedDirectories,
    appendDirectories,
    printSubdirectories,
}