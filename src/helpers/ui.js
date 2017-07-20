const command = require('../core/command');
const $ul = document.querySelector('.wrap .content ul');
const $modal = document.querySelector('.wrap');

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
    let showAllOption = directories.length <= 2;
    
    clearUl();

    directories.forEach(directory => {
        if(!showAllOption && directory === 'All') return;

        const option = document.createElement('li');
        option.value = directory;
        option.innerHTML = directory;

        if (lastDirectory === directory) {
            option.classList.add('selected');
        }

        $ul.appendChild(option);
    });
};

exports.printConsoles = (consoles) => {
    const { lastConsole } = store.getState();
    
    clearUl();

    for (con in consoles) {
        const li = document.createElement('li');
        li.value = con;
        li.innerHTML = con;

        if (lastConsole && lastConsole === con) {
            li.classList.add('selected');
        }

        $ul.appendChild(li);
    }
};

exports.toggleModal = (activate) => {
    if(activate)
        $modal.classList.add('active');
    else
        $modal.classList.remove('active');    
}

const clearUl = () => {
    if ($ul.hasChildNodes()) {
        $ul.innerHTML = '';
    }
}

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