exports.exec = (url) => {
    child_process.exec(`cd C:/ && cd ${url} && start "" "C:/Program Files/Git/bin/sh.exe" --login -i`);
}