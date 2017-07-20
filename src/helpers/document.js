const { dialog } = require('electron').remote;
const { ipcRenderer, shell } = require('electron');
const { version } = require('../../package.json');
const fs = require('fs');
const path = require('path');
const command = require('../core/command');

const $updateAvailable = document.getElementById('updateAvailable');
const $savedDirectories = document.getElementById('savedDirectories');
const $directoryList = document.getElementById('directoryList');
const $consoleList = document.getElementById('consoleList');
const $removeButton = document.getElementById('removeButton');
const $browseButton = document.getElementById('browseButton');

let store = {};

const openSubdirectory = (index) => {
    const { filteredSubdirectories } = store.getState();
    const con = $consoleList.options[$consoleList.selectedIndex].value;
    const sub = filteredSubdirectories[index];
    const currentPath = sub.root ? path.join(sub.root, sub.folder) : sub.folder;
    command.exec(currentPath, con);
};

const selectSubdirectory = () => {
    const { selectedSubdirectory } = store.getState();
    if (selectedSubdirectory === null) {
        return;
    }

    const subdirectory = $directoryList.children[selectedSubdirectory];

    subdirectory.classList.add('selected');

    const buttonBoundaries = subdirectory.getBoundingClientRect();
    const containerBoundaries = $directoryList.getBoundingClientRect();
    if (buttonBoundaries.bottom > containerBoundaries.height &&
        buttonBoundaries.top > containerBoundaries.height) {
        subdirectory.scrollIntoView(false);
    }
    if (buttonBoundaries.top < containerBoundaries.top) {
        subdirectory.scrollIntoView();
    }
};

const deselectSubdirectory = () => {
    const { selectedSubdirectory } = store.getState();
    if (selectedSubdirectory !== null) {
        $directoryList.children[selectedSubdirectory].classList.remove('selected');
    } else {
        $directoryList.scrollTop = 0;
    }
};

const selectSubdirectoryUp = () => {
    const { selectedSubdirectory } = store.getState();
    let index;

    if (selectedSubdirectory !== null) {
        deselectSubdirectory();
        index = selectedSubdirectory - 1;

        if (index < 0) {
            index = 0;
        }

        store.setState({
            selectedSubdirectory: index
        });
    }
};

const selectSubdirectoryDown = () => {
    const { selectedSubdirectory } = store.getState();
    let index;

    if (selectedSubdirectory !== null) {
        deselectSubdirectory();
        index = selectedSubdirectory + 1;

        if (index >= $directoryList.children.length) {
            index = $directoryList.children.length - 1;
        }
    } else {
        index = 0;
    }

    store.setState({
        selectedSubdirectory: index
    });
};

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

    $removeButton.addEventListener('click', () => {
        const { directories } = store.getState();
        const clonedDirectories = directories.slice(0);
        clonedDirectories.splice($savedDirectories.selectedIndex, 1);
        store.setState({
            lastDirectory: clonedDirectories[0] || '',
            directories: clonedDirectories
        });
    });

    $browseButton.addEventListener('click', () => {
        const { directories } = store.getState();
        ipcRenderer.send('mark-as-browsing');
        const paths = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (paths) {
            const newDirectory = paths[0];
            const partialState = { lastDirectory: newDirectory };

            if (!directories.includes(newDirectory)) {
                partialState.directories = directories.concat(newDirectory);
            }

            store.setState(partialState);
        }
    });

    $updateAvailable.addEventListener('click', () => {
        shell.openExternal('https://github.com/wistcc/git-easy/releases');
    });

    document.onkeyup = (e) => {
        const { selectedSubdirectory } = store.getState();
        let { directoryFilter } = store.getState();

        const key = Number(e.key);

        if (key >= 0) {
            openSubdirectory(key);
        }

        // Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }

        // Backspace was pressed
        if (e.keyCode === 8) {
            store.setState({
                directoryFilter: directoryFilter.slice(0, -1)
            });
        }

        // Key up was pressed
        if (e.keyCode === 38) {
            selectSubdirectoryUp();
        }

        // Key down was pressed
        if (e.keyCode === 40) {
            selectSubdirectoryDown();
        }

        // Enter was pressed
        if (e.keyCode === 13) {
            openSubdirectory(selectedSubdirectory);
        }

        // Any a-z letter was pressed
        if (/^[A-Z]$/i.test(e.key)) {
            store.setState({
                directoryFilter: directoryFilter += e.key
            });
        }
    };
};

const appendDirectories = (directory) => {
    if (!directory) return;

    let allSubDirectories = [];
    let currentDirectory = null;

    if (directory === 'All') {
        const { directories } = store.getState();

        directories.forEach((dir) => {
            if (dir === 'All') return;

            allSubDirectories.push(
                ...fs.readdirSync(dir)
                    .map(sub => ({
                        root: dir,
                        folder: sub
                    }))
            );
        });
    } else {
        const subs = fs.readdirSync(directory);
        allSubDirectories = subs.map(sub => ({
            root: directory,
            folder: sub
        }));

        if (subs.includes('.git')) {
            currentDirectory = {
                root: null,
                folder: directory
            };
        }
    }

    const currentSubDirectories = allSubDirectories.filter((sub) => {
        const currentPath = path.join(sub.root, sub.folder);
        return fs.lstatSync(currentPath).isDirectory() &&
            fs.readdirSync(currentPath).includes('.git');
    });

    if (currentDirectory) {
        currentSubDirectories.push(currentDirectory);
    }

    store.setState({
        subdirectories: currentSubDirectories
    });
};

const checkForUpdates = () => {
    fetch('https://api.github.com/repos/wistcc/git-easy/tags')
        .then(response => response.json())
        .then((data) => {
            const lastVersion = data[data.length - 1].name.substr(1).split('.');
            const currentVersion = version.split('.');
            let showUpdateButton = false;

            lastVersion.forEach((n, i) => {
                if (showUpdateButton) return;

                if (n > currentVersion[i]) {
                    showUpdateButton = true;
                }
            });

            if (showUpdateButton) {
                $updateAvailable.classList.remove('hidden');
            }
        });
};

// When main-window is hidden, reset filter
ipcRenderer.on('clear-filter', () => {
    store.setState({
        directoryFilter: '',
        selectedSubdirectory: null
    });
});

module.exports = {
    init,
    appendDirectories,
    checkForUpdates,
    selectSubdirectory,
    deselectSubdirectory
};
