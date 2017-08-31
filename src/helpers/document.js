const { dialog } = require('electron').remote;
const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const command = require('../core/command');

const $updateAvailable = document.getElementById('updateAvailable');
const $directoryList = document.getElementById('directoryList');
const $savedDirectories = document.getElementById('btn-folders');
const $removeButton = document.getElementById('removeButton');
const $browseButton = document.getElementById('browseButton');
const $consoles = document.getElementById('btn-consoles');
const $modal = document.querySelector('.wrap');

let store = {};

const openSubdirectory = (index) => {
    const { filteredSubdirectories, lastConsole } = store.getState();
    const sub = filteredSubdirectories[index || 0];

    if (!sub) {
        return;
    }

    const currentPath = sub.root ? path.join(sub.root, sub.folder) : sub.folder;
    command.exec(currentPath, lastConsole);
};

const selectSubdirectory = () => {
    const { selectedSubdirectory } = store.getState();
    if (selectedSubdirectory === null) {
        return;
    }

    const subdirectory = $directoryList.children[selectedSubdirectory];

    subdirectory.classList.add('selected');

    const buttonBoundaries = subdirectory.getBoundingClientRect();
    const containerBoundaries = $directoryList.parentElement.getBoundingClientRect();
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
        $directoryList.parentElement.scrollTop = 0;
    }
};

const selectSubdirectoryUp = () => {
    const { selectedSubdirectory } = store.getState();
    let index;

    if (selectedSubdirectory !== null) {
        deselectSubdirectory();
        index = selectedSubdirectory - 1;

        if (index < 0) {
            index = null;
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

    $consoles.addEventListener('click', () => {
        const { modalActive, selectedPanel } = store.getState();
        store.setState({
            selectedPanel: 'consoles',
            modalActive: selectedPanel !== 'consoles' || !modalActive
        });
    });

    $savedDirectories.addEventListener('click', () => {
        const { modalActive, selectedPanel } = store.getState();
        store.setState({
            selectedPanel: 'directories',
            modalActive: selectedPanel !== 'directories' || !modalActive
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

    document.onclick = (ev) => {
        // TODO: modal state should be in the state rather than querying the DOM
        if (
            !$modal.contains(ev.target)
            && $modal.classList.contains('active')
            && !$consoles.contains(ev.target)
            && !$savedDirectories.contains(ev.target)
        ) {
            store.setState({
                modalActive: false,
                selectedPanel: ''
            });
        }
    };

    document.onkeydown = (e) => {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    };

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
    deselectSubdirectory();
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
