const command = require('../core/command');

exports.printSubdirectories = (subdirectories) => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    return subdirectories
        .forEach((s, i) => {
            const index = (s.folder.lastIndexOf('/') + 1) || (s.folder.lastIndexOf('\\') + 1);
            const name = s.isAllSelected ? s.folder : s.folder.substr(index);
            addSubDirectoryButton(
                directoryList,
                name,
                s.folder,
                i < 10 ? i : -1);
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
    let showAllOption = true;
    if (directories.length <= 2) {
        showAllOption = false;
    }

    directories.forEach(directory => {
        if(!showAllOption && directory === 'All') return;

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

    const innerHTML = buttonIndex >= 0 ? `[${buttonIndex}]${name}` : name;

    button.innerHTML = innerHTML;
    button.className = 'directoryButton';
    button.setAttribute('data-path', directory);

    button.addEventListener("click", (e) => {
        const con = $consoleList.options[$consoleList.selectedIndex].value;
        command.exec(e.srcElement.getAttribute('data-path'), con);
    });

    rootElement.appendChild(button);
};