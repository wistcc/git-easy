const command = require('../core/command');
const $ul = document.querySelector('.wrap .content ul');
const $modal = document.querySelector('.wrap');
let store = {};

exports.init = (localStore) => {
    store = localStore;
}

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
                subdirectories.filter(ss => ss.folder === s.folder).length > 1
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

exports.printConsoles = (consoles, lastConsole) => {
    clearUl();

    for (const key in consoles) {
        const $li = document.createElement('li');
        $li.value = key;
        $li.innerHTML = key;

        if (lastConsole && lastConsole === key) {
            $li.classList.add('selected');
        }

        $li.addEventListener('click', () => {
            store.setState({
                lastConsole: key,
                modalActive: false,
            });
        });

        $ul.appendChild($li);
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

    $button.addEventListener("click", function (e) {
        const { lastConsole } = store.getState();
        const path = this.getAttribute('data-path')
        command.exec(path, lastConsole);
    });

    return $button;
};