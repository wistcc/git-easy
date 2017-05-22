const consoles = require('./consoles');

exports.exec = (url, selectedConsole) => {
    const command = consoles.get()[selectedConsole].command;
    child_process.exec(`cd C:/ && cd ${url} && ${command}`);
}