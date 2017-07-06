const consoles = {
    win: {
        'Command Prompt': {
            command: 'start "" "cmd"',
        },
        'Git bash': {
            command: 'start "" "C:/Program Files/Git/bin/sh.exe"',
        },
    },
    linux: {
        Terminal: {
            command: 'gnome-terminal',
        },
    },
    mac: {
        Terminal: {
            command: 'open -a Terminal',
        },
    },
};

exports.get = () => {
    const platform = process.platform;
    if (/^win/.test(platform)) {
        return consoles.win;
    }
    if (/^linux/.test(platform)) {
        return consoles.linux;
    }
    if (/^darwin/.test(platform)) {
        return consoles.mac;
    }
    return null;
};
