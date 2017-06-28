const command = require('../core/command');

exports.printSubdirectories = (subdirectories) => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    return subdirectories
        .forEach((s, i) => {
            const currentPath = `${s.root}/${s.folder}`;
            addSubDirectoryButton(directoryList, s.folder, currentPath, i < 10 ? i : -1);
        });
}

exports.printFilter = (filter) => {
    document.getElementById('filter').innerHTML = filter;
}

exports.printSavedDirectories = (directories, lastDirectory) => {
    const $savedDirectories = document.getElementById('savedDirectories');

    while ($savedDirectories.hasChildNodes()) {
        $savedDirectories.removeChild($savedDirectories.lastChild);
    }

    directories.forEach(directory => {
        const option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;

        if (lastDirectory && lastDirectory === directory) {
            option.selected = true;
        }

        $savedDirectories.appendChild(option);
    });
};

exports.printConsoles = (consoles) => {
    const { lastConsole } = store.getState();
    const $consoleList = document.getElementById('consoleList');

    for (con in consoles) {
        const option = document.createElement('option');
        option.value = con;
        option.innerHTML = con;

        if (lastConsole && lastConsole === con) {
            option.selected = true;
        }

        consoleList.appendChild(option);
    }
};

const addSubDirectoryButton = (rootElement, name, directory, buttonIndex) => {
    const button = document.createElement('button');
    const $consoleList = document.getElementById('consoleList');

    const innerHTML = buttonIndex >= 0 ? `${buttonIndex}- ${name}` : name;

    button.innerHTML = innerHTML;
    button.className = 'directoryButton';
    button.setAttribute('data-path', directory);

    button.addEventListener("click", (e) => {
        const con = $consoleList.options[$consoleList.selectedIndex].value;
        command.exec(e.srcElement.getAttribute('data-path'), con);
    });

    rootElement.appendChild(button);
};