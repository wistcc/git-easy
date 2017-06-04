const consoles = {
    win: {
        'cmd': {
            command: 'start "" "cmd"',
        },
        'Git bash': {
            command: 'start "" "C:/Program Files/Git/bin/sh.exe"',
        },
    },
    linux: {
        'Terminal': {
            command: 'gnome-terminal',
        },
    },
};

exports.get = () => {
    if(/^win/.test(process.platform)) {
        return consoles['win'];
    }
    if(/^linux/.test(process.platform)) {
        return consoles['linux'];
    }
}