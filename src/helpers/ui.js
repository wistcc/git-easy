const command = require('../core/command');

const addSubDirectoryButton = (name, directory, buttonIndex, shouldPrintDirectory) => {
    const button = document.createElement('div');
    const $text = document.createElement('div');
    const $path = document.createElement('div');
    const $consoleList = document.getElementById('consoleList');

    $path.innerHTML = directory;
    $text.innerHTML = buttonIndex >= 0 ? ` [${buttonIndex}]${name}` : name;

    button.className = 'directoryButton';
    $text.className = 'inner-text';
    $path.className = 'inner-path';

    button.setAttribute('data-path', directory);

    button.appendChild($text);

    if (shouldPrintDirectory) {
        button.appendChild($path);
        button.classList.add('with-path');
    }

    button.addEventListener('click', (e) => {
        const con = $consoleList.options[$consoleList.selectedIndex].value;
        const path = e.srcElement.getAttribute('data-path') ||
            e.srcElement.parentElement.getAttribute('data-path');
        command.exec(path, con);
    });

    return button;
};

exports.printSubdirectories = (subdirectories) => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    return subdirectories
        .map((s, i) => addSubDirectoryButton(
                s.folder,
                s.root ? `${s.root}/${s.folder}` : s.folder,
                i < 10 ? i : -1,
                subdirectories.filter(ss => ss.folder === s.folder).length > 1,
                ))
        .forEach(b => directoryList.appendChild(b));
};

exports.printFilter = (filter) => {
    document.getElementById('filter').innerHTML = filter;
};

exports.printSavedDirectories = (directories, lastDirectory) => {
    const $savedDirectories = document.getElementById('savedDirectories');

    while ($savedDirectories.hasChildNodes()) {
        $savedDirectories.removeChild($savedDirectories.lastChild);
    }
    let showAllOption = true;
    if (directories.length <= 2) {
        showAllOption = false;
    }

    directories.forEach((directory) => {
        if (!showAllOption && directory === 'All') return;

        const option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;

        if (lastDirectory && lastDirectory === directory) {
            option.selected = true;
        }

        $savedDirectories.appendChild(option);
    });
};

exports.printConsoles = (consoles, lastConsole) => {
    const $consoleList = document.getElementById('consoleList');

    Object.keys(consoles).forEach((key) => {
        const option = document.createElement('option');
        option.value = key;
        option.innerHTML = key;

        if (lastConsole && lastConsole === key) {
            option.selected = true;
        }

        $consoleList.appendChild(option);
    });
};
