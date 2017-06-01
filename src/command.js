const consoles = require('./consoles');

exports.exec = (path, selectedConsole) => {
    const command = consoles.get()[selectedConsole].command;
    child_process.exec(`cd && cd ${path} && ${command}`);
}