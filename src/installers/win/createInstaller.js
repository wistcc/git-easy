const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

const getInstallerConfig = () => {
    /* eslint-disable no-console */
    console.log('creating windows installer');
    const rootPath = path.join('./');
    const outPath = path.join(rootPath, 'release-builds');

    return Promise.resolve({
        appDirectory: path.join(outPath, 'git-easy-win32-ia32/'),
        authors: 'Winner Crespo',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'git-easy.exe',
        setupExe: 'git-easy.exe',
    });
};

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        /* eslint-disable no-console */
        console.error(error.message || error);
        process.exit(1);
    });
