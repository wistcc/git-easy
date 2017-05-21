var { app } = require('electron').remote;
var fs = require('fs');
var path = require('path');
const directoriesKey = 'directories';
var data = null;
var dataFilePath = path.join(app.getPath('userData'), 'data.json'); 

function load() {
    if (data !== null) {
        return;
    } 

    if (!fs.existsSync(dataFilePath)) {
        data = {};
        data[directoriesKey] = [];
        return;
    }

    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')); 
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data)); 
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