const {dialog} = require('electron').remote;
const {ipcRenderer} = require('electron');
const storage = require('./src/storage');
const command = require('./src/command');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

var browseButton = document.getElementById('browseButton');
var savedDirectories = document.getElementById('savedDirectories');
var directoryList = document.getElementById('directoryList');
var directories = storage.getDirectories();

directories.forEach(directory => {
    var option = document.createElement('option');
    option.value = directory;
    option.innerHTML = directory;
    savedDirectories.appendChild(option);
});

const subDirectories = fs.readdirSync(directories[0])
    .filter(file => fs.lstatSync(path.join(directories[0], file)).isDirectory());
subDirectories.forEach(subDirectory => {
    var button = document.createElement('button');
    button.innerHTML = subDirectory;
    button.className = 'directoryButton';
    button.setAttribute('data-path', `${directories[0]} /${subDirectory}`);
    button.addEventListener("click", (e) => {            
        command.exec(e.srcElement.getAttribute('data-path'));
    });
    directoryList.appendChild(button);
});

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