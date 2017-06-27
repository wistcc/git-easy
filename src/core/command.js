const consoles = require('./consoles');
const child_process = require('child_process');

exports.exec = (path, selectedConsole) => {
    const platform = process.platform;
    const command = consoles.get()[selectedConsole].command;
    let fullCommand = '';

    if (/^win/.test(platform)) {
        const drive = path.substr(0,2);
        fullCommand = `${drive} && cd ${path} && ${command}`;
    }
    if (/^linux/.test(platform)) {
        fullCommand = `cd / && cd ${path} && ${command}`;
    }
    if (/^darwin/.test(platform)) {
        fullCommand = `${command} ${path}`;
    }

    child_process.exec(fullCommand);
}