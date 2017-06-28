const { dialog } = require('electron').remote;
const { ipcRenderer, shell } = require('electron');
const { version } = require('../../package.json');
const fs = require('fs');
const path = require('path');
const command = require('../core/command');

const $updateAvailable = document.getElementById('updateAvailable');
const $savedDirectories = document.getElementById('savedDirectories');
const $consoleList = document.getElementById('consoleList');
const $removeButton = document.getElementById('removeButton');
const $browseButton = document.getElementById('browseButton');

let store = {};

const init = (localStore) => {
    store = localStore;

    $consoleList.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        store.setState({
            lastConsole: option
        });
    });

    $savedDirectories.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        store.setState({
            lastDirectory: option
        });
    });

    $removeButton.addEventListener("click", (ev) => {
        const { directories } = store.getState();
        const clonedDirectories = directories.slice(0);
        clonedDirectories.splice($savedDirectories.selectedIndex, 1);
        store.setState({
            lastDirectory: clonedDirectories[0] || '',
            directories: clonedDirectories,
        });
    });

    $browseButton.addEventListener("click", () => {
        const { directories } = store.getState();
        ipcRenderer.send('mark-as-browsing');
        const paths = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (paths) {
            const newDirectory = paths[0];
            const partialState = { lastDirectory: newDirectory };

            if(!directories.includes(newDirectory))
                partialState.directories = directories.concat(newDirectory);
            
            store.setState(partialState);
        }
    });

    document.onkeyup = (e) => {
        const { filteredSubdirectories } = store.getState();
        let { directoryFilter } = store.getState();

        $updateAvailable.addEventListener("click", () => {
            shell.openExternal('https://github.com/wistcc/git-easy/releases');
        });

        const key = Number(e.key);
        if (key >= 0) {
            const con = $consoleList.options[$consoleList.selectedIndex].value;
            const sub = filteredSubdirectories[key];
            command.exec(path.join(sub.root, sub.folder), con);
        }

        //Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }

        //Backspace was pressed
        if (e.keyCode === 8) {
            store.setState({
                directoryFilter: directoryFilter.slice(0, -1),
            });
        }

        // Any a-z letter was pressed
        if (/^[A-Z]$/i.test(e.key)) {
            store.setState({
                directoryFilter: directoryFilter += e.key,
            });
        }
    };
};

const appendDirectories = (directory) => {
    if (!directory) {
        store.setState({
            subdirectories: [],
        });
        return;
    }

    let isAllSelected = false;
    let allSubDirectories = [];

    if (directory === 'All') {
        const { directories } = store.getState();
        isAllSelected = true;

        directories.forEach(dir => {
            if(dir === 'All') return;

            allSubDirectories.push(
                ...fs.readdirSync(dir).map(sub => path.join(dir, sub)),
            );
        });
    } else {
        allSubDirectories = fs.readdirSync(directory)
            .map(sub => path.join(directory, sub));
    }

    const currentSubDirectories = allSubDirectories.filter(currentPath => {
        return fs.lstatSync(currentPath).isDirectory() &&
            fs.readdirSync(currentPath).includes(".git");
    });

    if (allSubDirectories.includes(".git"))
        currentSubDirectories.push(directory);

    const subdirectories = currentSubDirectories.map(s => ({
        folder: s,
        isAllSelected,
    }));

    store.setState({
        subdirectories
    });
};

const checkForUpdates = () => {
    fetch('https://api.github.com/repos/wistcc/git-easy/tags')
        .then(response => {
            return response.json();
        })
        .then(data => {
            //TODO: get the correct version number and compare which is greater. Semver compare.
            if (!data[0].name.includes(version)) {
                $updateAvailable.classList.remove('hidden');
            }
        });
};

// When main-window is hidden, reset filter
ipcRenderer.on('clear-filter', () => {
    store.setState({
        directoryFilter: ''
    });
});

module.exports = {
    init,
    appendDirectories,
    checkForUpdates,
};