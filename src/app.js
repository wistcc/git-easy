const {dialog} = require('electron').remote;
const {ipcRenderer} = require('electron');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const storage = require('./src/storage');
const command = require('./src/command');
const consoles = require('./src/consoles');

var browseButton = document.getElementById('browseButton');
var savedDirectories = document.getElementById('savedDirectories');
var directoryList = document.getElementById('directoryList');
var consoleList = document.getElementById('consoleList');

var directories = storage.getDirectories();
const defaultConsoles = consoles.get();

const appendDirectories = (directory) => {
    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }
    
    const subDirectories = fs.readdirSync(directory)
        .filter(file => fs.lstatSync(path.join(directory, file)).isDirectory());

    subDirectories.forEach(subDirectory => {
        var button = document.createElement('button');
        button.innerHTML = subDirectory;
        button.className = 'directoryButton';
        button.setAttribute('data-path', `${directory} /${subDirectory}`);

        button.addEventListener("click", (e) => { 
            var list = document.getElementById("consoleList");
            var con = list.options[list.selectedIndex].value;

            command.exec(e.srcElement.getAttribute('data-path'), con);
        });

        directoryList.appendChild(button);
    });
};

for(con in defaultConsoles){
    var option = document.createElement('option');
    option.value = con;
    option.innerHTML = con;
    consoleList.appendChild(option);
}

directories.forEach(directory => {
    var option = document.createElement('option');
    option.value = directory;
    option.innerHTML = directory;
    savedDirectories.appendChild(option);
});

savedDirectories.addEventListener('change', (e) => {
    const list = e.srcElement;
    const option = list.options[list.selectedIndex].value;
    appendDirectories(option);
});

appendDirectories(directories[0]);

browseButton.addEventListener("click", () => {
    ipcRenderer.send('mark-as-browsing');
    const paths = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if(paths) {
        paths.forEach(path => {
            storage.setDirectories(path);
        });
    }
});