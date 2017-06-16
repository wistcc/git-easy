const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const storage = require('./storage');
const command = require('../core/command');
const consoles = require('../core/consoles');

const lastDirectory = storage.getLastDirectory() || storage.getDirectories()[0];
let currentSubDirectories = [];

var savedDirectories = document.getElementById('savedDirectories');
var consoleList = document.getElementById('consoleList');

const init = () => {
    var removeButton = document.getElementById('removeButton');
    var browseButton = document.getElementById('browseButton');

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
    });

    removeButton.addEventListener("click", () => {
        storage.deleteDirectory(savedDirectories.selectedIndex);

        const currentDirectory = storage.getDirectories()[0];
        appendDirectories(currentDirectory);
        storage.setLastDirectory(currentDirectory);
        appendSavedDirectories();
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
        }
    });

    document.onkeyup = function(e) {
        const key = Number(e.key);
        if (key >= 0) {
            var list = document.getElementById("consoleList");
            var con = list.options[list.selectedIndex].value;
            command.exec(currentSubDirectories[key], con);
        }

        //Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }
    };
};

const appendDirectories = (directory = lastDirectory) => {
    var directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    if (!directory) {
        return;
    }

    const allSubDirectories = fs.readdirSync(directory);
    const subDirectories = allSubDirectories.filter(file => {
        const currentPath = path.join(directory, file);
        return fs.lstatSync(currentPath).isDirectory() &&
            fs.readdirSync(currentPath).indexOf(".git") > -1;
    });

    let index = 0;

    const addSubDirectoryButton = (name, directory) => {
        const button = document.createElement('button');
        const innerHTML = index < 10 ? `${index}- ${name}` : name;

        if (index < 10){
            index++;
        }

        button.innerHTML = innerHTML;
        button.className = 'directoryButton';
        button.setAttribute('data-path', directory);

        button.addEventListener("click", (e) => { 
            const list = document.getElementById("consoleList");
            const con = list.options[list.selectedIndex].value;

            command.exec(e.srcElement.getAttribute('data-path'), con);
        });

        directoryList.appendChild(button);
    }

    if (allSubDirectories.indexOf(".git") > -1) {
        currentSubDirectories.push(directory);

        const index = /^win/.test(process.platform) ? directory.lastIndexOf('\\') : directory.lastIndexOf('/');
        addSubDirectoryButton(
            directory.substr(index > -1 ? (index + 1) : 0),
            directory);
    }

    subDirectories.forEach(subDirectory => {
        const currentPath = `${directory}/${subDirectory}`;
        currentSubDirectories.push(currentPath);
        addSubDirectoryButton(subDirectory, currentPath);
    });
};

const appendSavedDirectories = () => {
    while (savedDirectories.hasChildNodes()) {
        savedDirectories.removeChild(savedDirectories.lastChild);
    }
    
    var directories = storage.getDirectories();
    const last = storage.getLastDirectory();
    directories.forEach(directory => {
        var option = document.createElement('option');
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

    for(con in defaultConsoles){
        var option = document.createElement('option');
        option.value = con;
        option.innerHTML = con;

        if (lastConsole && lastConsole === con) {
            option.selected = true;
        }

        consoleList.appendChild(option);
    }
};

module.exports = {
    init,
    appendConsoles,
    appendSavedDirectories,
    appendDirectories,
}