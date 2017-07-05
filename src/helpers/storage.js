const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const directoriesKey = 'directories';
const lastDirectoryKey = 'lastDirectory';
const lastConsoleKey = 'lastConsole';
const dataFilePath = path.join(app.getPath('userData'), 'data.json');
let data = null;

const defaultData = {
    directories: ['All'],
    lastDirectory: '',
    directoryFilter: '',
    subdirectories: [],
    filteredSubdirectories: [],
    lastConsole: {},
    globalShortcut: 'CommandOrControl+Shift+`',
};

const load = () => {
    if (data !== null) {
        return;
    }

    if (!fs.existsSync(dataFilePath)) {
        data = defaultData;
        save();
        return;
    }

    data = Object.assign(defaultData,  JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')));

    if (data.directories.indexOf('All') === -1) {
        data.directories.unshift('All');
    }
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