const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const consoles = require('../core/consoles');

const directoriesKey = 'directories';
const lastDirectoryKey = 'lastDirectory';
const lastConsoleKey = 'lastConsole';
const dataFilePath = path.join(app.getPath('userData'), 'data.json');
let data = null;

const defaultConsole = Object.keys(consoles.get())[0];

const defaultData = {
    [directoriesKey]: ['All'],
    [lastDirectoryKey]: '',
    directoryFilter: '',
    selectedSubdirectory: null,
    subdirectories: [],
    filteredSubdirectories: [],
    [lastConsoleKey]: defaultConsole,
    globalShortcut: 'CommandOrControl+Shift+`',
    modalActive: false,
    selectedPanel: ''
};

const save = () => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
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

    data = Object.assign(defaultData, JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')));

    if (data.directories.indexOf('All') === -1) {
        data.directories.unshift('All');
    }
};

exports.setLastConsole = (value) => {
    load();
    data[lastConsoleKey] = value;
    save();
};

exports.setLastDirectory = (value) => {
    load();
    data[lastDirectoryKey] = value;
    save();
};

exports.setDirectories = (value) => {
    load();
    data[directoriesKey] = value;
    save();
};

exports.getInitialState = () => {
    load();
    return data;
};
