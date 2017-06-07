const consoles = require('./consoles');
const child_process = require('child_process');

exports.exec = (path, selectedConsole) => {
    const command = consoles.get()[selectedConsole].command;
    let fullCommand = `cd / && cd ${path} && ${command}`;

    if(/^win/.test(process.platform)) {
        const drive = path.substr(0,2);
        fullCommand = `${drive} && cd ${path} && ${command}`;
    }

    child_process.exec(fullCommand);
}