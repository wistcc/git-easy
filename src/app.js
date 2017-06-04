const {dialog} = require('electron').remote;
const {ipcRenderer} = require('electron');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const storage = require('./src/core/storage');
const command = require('./src/core/command');
const consoles = require('./src/core/consoles');

var browseButton = document.getElementById('browseButton');
var removeButton = document.getElementById('removeButton');
var savedDirectories = document.getElementById('savedDirectories');
var directoryList = document.getElementById('directoryList');
var consoleList = document.getElementById('consoleList');

const defaultConsoles = consoles.get();
const lastConsole = storage.getLastConsole();

const appendDirectories = (directory) => {
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

    const addSubDirectoryButton = (name, directory) => {
        var button = document.createElement('button');
        button.innerHTML = name;
        button.className = 'directoryButton';
        button.setAttribute('data-path', directory);

        button.addEventListener("click", (e) => { 
            var list = document.getElementById("consoleList");
            var con = list.options[list.selectedIndex].value;

            command.exec(e.srcElement.getAttribute('data-path'), con);
        });

        directoryList.appendChild(button);
    }

    if (allSubDirectories.indexOf(".git") > -1) {
        const index = /^win/.test(process.platform) ? directory.lastIndexOf('\\') : directory.lastIndexOf('/');
        addSubDirectoryButton(
            directory.substr(index > -1 ? (index + 1) : 0),
            directory);
    }

    subDirectories.forEach(subDirectory => {
        addSubDirectoryButton(subDirectory, `${directory}/${subDirectory}`);
    });
};

const appendSavedDirectories = () => {
    while (savedDirectories.hasChildNodes()) {
        savedDirectories.removeChild(savedDirectories.lastChild);
    }
    
    var directories = storage.getDirectories();
    const lastDirectory = storage.getLastDirectory();
    directories.forEach(directory => {
        var option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;
        
        if(lastDirectory && lastDirectory === directory) {
            option.selected = true;
        }

        savedDirectories.appendChild(option);
    });
};

for(con in defaultConsoles){
    var option = document.createElement('option');
    option.value = con;
    option.innerHTML = con;

    if(lastConsole && lastConsole === con) {
        option.selected = true;
    }

    consoleList.appendChild(option);
}

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

appendSavedDirectories();
appendDirectories(storage.getLastDirectory() || storage.getDirectories()[0]);

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

    if(paths) {
        storage.setDirectories(paths[0]);
        appendDirectories(paths[0]);
        storage.setLastDirectory(paths[0]);
        appendSavedDirectories();
    }
});