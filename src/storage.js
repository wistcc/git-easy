var { app } = require('electron').remote;
var fs = require('fs');
var path = require('path');
const directoriesKey = 'directories';
const lastDirectoryKey = 'lastDirectory';
const lastConsoleKey = 'lastConsole';
var data = null;
var dataFilePath = path.join(app.getPath('userData'), 'data.json'); 

function load() {
    if (data !== null) {
        return;
    } 

    if (!fs.existsSync(dataFilePath)) {
        data = {};
        data[directoriesKey] = [];
        data[lastDirectory] = null;
        data[lastConsole] = null;
        return;
    }

    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')); 
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data)); 
}

exports.setLastConsole = function (value) {
    load();
    data[lastConsoleKey] = value;
    save();
}

exports.getLastConsole = function () { 
    load();
    var value = null;

    if (lastConsoleKey in data) {
        value = data[lastConsoleKey];
    } 

    return value;
}

exports.setLastDirectory = function (value) {
    load();
    data[lastDirectoryKey] = value;
    save();
}

exports.getLastDirectory = function () { 
    load();
    var value = null;

    if (lastDirectoryKey in data) {
        value = data[lastDirectoryKey];
    } 

    return value;
}

exports.setDirectories = function (value) {
    load();
    data[directoriesKey].push(value);
    save();
}

exports.getDirectories = function () { 
    load();
    var value = [];

    if (directoriesKey in data) {
        value = data[directoriesKey];
    } 

    return value;
}

exports.deleteDirectory = function (index) { 
    load();
    if (directoriesKey in data) {
        delete data[directoriesKey][index];
        save();
    }
}