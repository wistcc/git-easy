const consoles = require('./consoles');
const child_process = require('child_process');

exports.exec = (path, selectedConsole) => {
    const command = consoles.get()[selectedConsole].command;
    child_process.exec(`cd && cd ${path} && ${command}`);
}