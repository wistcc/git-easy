const command = require('../core/command');

exports.printSubdirectories = (subdirectories) => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }

    return subdirectories
        .map((s, i) => {
            return addSubDirectoryButton(
                s.folder,
                s.root ? `${s.root}/${s.folder}` : s.folder,
                i < 10 ? i : -1,
                subdirectories.filter(ss => ss.folder === s.folder).length > 1,
                );
        })
        .forEach(b => directoryList.appendChild(b));
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

const addSubDirectoryButton = (name, directory, buttonIndex, shouldPrintDirectory) => {
    const $text = document.createElement('div');
    const $path = document.createElement('div');
    const $button = document.createElement('div');
    const $number = document.createElement('div');
    const $consoleList = document.getElementById('consoleList');
  
    $path.innerHTML = directory;
    $number.innerHTML = buttonIndex >= 0 ? buttonIndex : '';
    $text.innerHTML = name;
    
    $button.className = 'directoryButton';
    $text.className = 'inner-text';
    $path.className = 'inner-path';
    $number.className = 'inner-number';
    
    $button.setAttribute('data-path', directory);
    
    $button.appendChild($number);
    $button.appendChild($text);
    $button.appendChild($path);  

    $button.addEventListener("click", (e) => {
        const con = $consoleList.options[$consoleList.selectedIndex].value;
        const path = $button.getAttribute('data-path')
        command.exec(path, con);
    });

    return $button;
};