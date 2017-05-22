const consoles = {
    win: {
        'cmd': {
            command: 'start "" "cmd"',
        },
        'Git bash': {
            command: 'start "" "C:/Program Files/Git/bin/sh.exe"',
        },
    },
};

exports.get = () => {
    if(/^win/.test(process.platform)) {
        return consoles['win'];
    }
}