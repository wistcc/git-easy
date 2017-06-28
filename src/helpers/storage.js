const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const directoriesKey = 'directories';
const lastDirectoryKey = 'lastDirectory';
const lastConsoleKey = 'lastConsole';
const dataFilePath = path.join(app.getPath('userData'), 'data.json');
let data = null;

const load = () => {
    if (data !== null) {
        return;
    } 

    if (!fs.existsSync(dataFilePath)) {
        data = {
            directories: [],
            lastDirectory: '',
            directoryFilter: '',
            subdirectories: [],
            filteredSubdirectories: [],
            lastConsole: {},
        };
        save();
        return;
    }

    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
}

const save = () => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data)); 
}

exports.setLastConsole = value => {
    load();
    data[lastConsoleKey] = value;
    save();
}

exports.setLastDirectory = value => {
    load();
    data[lastDirectoryKey] = value;
    save();
}

exports.setDirectories = value => {
    load();
    data[directoriesKey] = value;
    save();
}

exports.getInitialState = () => {
    load();
    return data;
}