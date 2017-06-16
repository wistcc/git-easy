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
        return data;
    } 

    if (!fs.existsSync(dataFilePath)) {
        data = {
            directories: [],
            lastDirectory: '',
            lastConsole: '',
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

exports.getLastConsole = () => { 
    load();
    var value = null;

    if (lastConsoleKey in data) {
        value = data[lastConsoleKey];
    } 

    return value;
}

exports.setLastDirectory = value => {
    load();
    data[lastDirectoryKey] = value;
    save();
}

exports.getLastDirectory = () => { 
    load();
    var value = null;

    if (lastDirectoryKey in data) {
        value = data[lastDirectoryKey];
    } 

    return value;
}

exports.setDirectories = value => {
    load();
    data[directoriesKey] = value;
    save();
}

exports.getDirectories = () => { 
    load();
    var value = [];

    if (directoriesKey in data) {
        value = data[directoriesKey];
    } 

    return value;
}

exports.deleteDirectory = index => { 
    load();
    if (directoriesKey in data) {
        data[directoriesKey].splice(index, 1);
        save();
    }
}

exports.getInitialState = () => {
    load();
    return data;
}