const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const storage = require('./storage');
const command = require('../core/command');
const consoles = require('../core/consoles');

const lastDirectory = storage.getLastDirectory() || storage.getDirectories()[0];
let subdirectories = [];

const savedDirectories = document.getElementById('savedDirectories');
const consoleList = document.getElementById('consoleList');

let dirFilter = '';

const init = () => {
    const removeButton = document.getElementById('removeButton');
    const browseButton = document.getElementById('browseButton');

    consoleList.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        storage.setLastConsole(option);
    });

    savedDirectories.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        storage.setLastDirectory(option);
        appendDirectories(option);
        printSubdirectories();
    });

    removeButton.addEventListener("click", () => {
        storage.deleteDirectory(savedDirectories.selectedIndex);

        const currentDirectory = storage.getDirectories()[0];
        appendDirectories(currentDirectory);
        storage.setLastDirectory(currentDirectory);
        appendSavedDirectories();
        printSubdirectories();
    });

    browseButton.addEventListener("click", () => {
        ipcRenderer.send('mark-as-browsing');
        const paths = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (paths) {
            storage.setDirectories(paths[0]);
            appendDirectories(paths[0]);
            storage.setLastDirectory(paths[0]);
            appendSavedDirectories();
            printSubdirectories();
        }
    });

    document.onkeyup = function (e) {
        const key = Number(e.key);
        if (key >= 0) {
            var list = document.getElementById("consoleList");
            var con = list.options[list.selectedIndex].value;
            command.exec(path.join(subdirectories[key].root, subdirectories[key].folder), con);
        }

        //Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }

        //Backspace was pressed
        if (e.keyCode === 8) {
            dirFilter = dirFilter.slice(0, -1);
            document.getElementById('filter').innerHTML = dirFilter;
            printSubdirectories();
        }

        // Any a-z letter was pressed
        if (/^[A-Z]$/i.test(e.key)) {
            dirFilter += e.key;
            document.getElementById('filter').innerHTML = dirFilter;
            printSubdirectories();
        }
    };
};

const appendDirectories = (directory = lastDirectory) => {
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

    subdirectories = currentSubDirectories.map(s => ({
        root: directory,
        folder: s,
    }));
};

const addSubDirectoryButton = (rootElement, name, directory, buttonIndex) => {
    const button = document.createElement('button');
    const innerHTML = buttonIndex >= 0 ? `${buttonIndex}- ${name}` : name;

    button.innerHTML = innerHTML;
    button.className = 'directoryButton';
    button.setAttribute('data-path', directory);

    button.addEventListener("click", (e) => {
        const list = document.getElementById("consoleList");
        const con = list.options[list.selectedIndex].value;

        command.exec(e.srcElement.getAttribute('data-path'), con);
    });

    rootElement.appendChild(button);
};

const printSubdirectories = () => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    const filterRegex = new RegExp(dirFilter, 'i');

    subdirectories
    .filter(s => filterRegex.test(s.folder))
    .forEach((s, i) => {
        const currentPath = `${s.root}/${s.folder}`;
        addSubDirectoryButton(directoryList, s.folder, currentPath, i < 10 ? i : -1);
    });
}

const appendSavedDirectories = () => {
    while (savedDirectories.hasChildNodes()) {
        savedDirectories.removeChild(savedDirectories.lastChild);
    }

    const directories = storage.getDirectories();
    const last = storage.getLastDirectory();
    directories.forEach(directory => {
        const option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;

        if (last && last === directory) {
            option.selected = true;
        }

        savedDirectories.appendChild(option);
    });
};

const appendConsoles = () => {
    const defaultConsoles = consoles.get();
    const lastConsole = storage.getLastConsole();

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

// When main-window is hidden, reset filter
ipcRenderer.on('clear-filter', () => {
    dirFilter = '';
});

module.exports = {
    init,
    appendConsoles,
    appendSavedDirectories,
    appendDirectories,
    printSubdirectories,
}