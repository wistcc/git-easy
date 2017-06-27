const { dialog } = require('electron').remote;
const { ipcRenderer, shell } = require('electron');
const { version } = require('../../package.json');
const fs = require('fs');
const path = require('path');
const storage = require('./storage');
const command = require('../core/command');
const consoles = require('../core/consoles');

const lastDirectory = storage.getLastDirectory() || storage.getDirectories()[0];

let currentSubDirectories = [];
let subdirectories = [];
let selectedDirectory = 0;


const $updateAvailable = document.getElementById('updateAvailable');
const $savedDirectories = document.getElementById('savedDirectories');
const $consoleList = document.getElementById('consoleList');
const $filter = document.getElementById('filter');

let dirFilter = '';

const init = () => {
    const removeButton = document.getElementById('removeButton');
    const browseButton = document.getElementById('browseButton');

    $consoleList.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        storage.setLastConsole(option);
    });

    $savedDirectories.addEventListener('change', (e) => {
        const list = e.srcElement;
        const option = list.options[list.selectedIndex].value;
        storage.setLastDirectory(option);

        selectedDirectory = 0;
        appendDirectories(option);      
        printSubdirectories();
    });

    removeButton.addEventListener("click", () => {
        storage.deleteDirectory($savedDirectories.selectedIndex);
        const currentDirectory = storage.getDirectories()[0];
        appendDirectories(currentDirectory);
        storage.setLastDirectory(currentDirectory);
        appendSavedDirectories();
        printSubdirectories();
    });

    browseButton.addEventListener("click", () => {
        ipcRenderer.send('mark-as-browsing');
        const paths = dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (paths) {
            storage.setDirectories(paths[0]);
            appendDirectories(paths[0]);
            storage.setLastDirectory(paths[0]);
            appendSavedDirectories();
            printSubdirectories();
        }
    });   

    $updateAvailable.addEventListener("click", () => {
        shell.openExternal('https://github.com/wistcc/git-easy/releases');
    });

    document.onkeyup = function (e) {
        const key = Number(e.key);
        if (key >= 0) {
            const con = $consoleList.options[$consoleList.selectedIndex].value;
            const sub = getFilteredSubdirectories(subdirectories, dirFilter)[key];
            command.exec(path.join(sub.root, sub.folder), con);
        }

        //Esc was pressed
        if (e.keyCode === 27) {
            ipcRenderer.send('hide-main-window');
        }

        //Up was pressed 
        if (e.keyCode === 38 ) {
            turnUpSelector();
        }

        //Enter was pressed
        if (e.keyCode === 13 ) {
           var btns = document.getElementsByClassName("directoryButton"); 
           btns[selectedDirectory].click();       
        }
        
        //Down was pressed
        if (e.keyCode === 40 ) {            
            turnDownSelector();
        }

        //Backspace was pressed
        if (e.keyCode === 8) {
            dirFilter = dirFilter.slice(0, -1);
            $filter.innerHTML = dirFilter;
            printSubdirectories();
        }

        // Any a-z letter was pressed
        if (/^[A-Z]$/i.test(e.key)) {
            dirFilter += e.key;
            $filter.innerHTML = dirFilter;
            printSubdirectories();
        }

    };
    
};

const turnUpSelector = () => {
    var btns = document.getElementsByClassName("directoryButton"); 
    btns[selectedDirectory].className = "directoryButton";  

     if (selectedDirectory == 0) {         
         selectedDirectory = (btns.length - 1);
         btns[selectedDirectory].className += " selected";
     }else{ 
        selectedDirectory--;
        btns[selectedDirectory].className += " selected";         
     }
};

const turnDownSelector = () =>{
     var btns = document.getElementsByClassName("directoryButton"); 

    selectedDirectory++;

    if( selectedDirectory > 0 ){
         btns[selectedDirectory - 1].className = "directoryButton"; 
    }
           

    if (selectedDirectory == btns.length) {
        btns[btns.length - 1].className = "directoryButton";
        selectedDirectory = 0;
    }

    btns[selectedDirectory].className += " selected";   
};

const appendDirectories = (directory = lastDirectory) => {
    if (!directory) {
        return;
    }

    const allSubDirectories = fs.readdirSync(directory);
    const currentSubDirectories = allSubDirectories.filter(file => {
        const currentPath = path.join(directory, file);
        return fs.lstatSync(currentPath).isDirectory() &&
            fs.readdirSync(currentPath).includes(".git");
    });

    if (allSubDirectories.includes(".git"))
        currentSubDirectories.push(directory);

    subdirectories = currentSubDirectories.map(s => ({
        root: directory,
        folder: s,
    }));
};

const addSubDirectoryButton = (rootElement, name, directory, buttonIndex) => {
    const button = document.createElement('button');
    const innerHTML = buttonIndex >= 0 ? `${buttonIndex}- ${name}` : name;

    button.innerHTML = innerHTML;
    button.className = 'directoryButton';
    button.setAttribute('data-path', directory);

    button.addEventListener("click", (e) => {
        const con = $consoleList.options[list.selectedIndex].value;

        command.exec(e.srcElement.getAttribute('data-path'), con);
    });

    rootElement.appendChild(button);
};

const printSubdirectories = () => {
    const directoryList = document.getElementById('directoryList');

    while (directoryList.hasChildNodes()) {
        directoryList.removeChild(directoryList.lastChild);
    }


    getFilteredSubdirectories(subdirectories, dirFilter)
        .forEach((s, i) => {
            const currentPath = `${s.root}/${s.folder}`;
            addSubDirectoryButton(directoryList, s.folder, currentPath, i < 10 ? i : -1);
        });
}

const appendSavedDirectories = () => {
    while ($savedDirectories.hasChildNodes()) {
        $savedDirectories.removeChild(savedDirectories.lastChild);
    }

    const directories = storage.getDirectories();
    const last = storage.getLastDirectory();
    directories.forEach(directory => {
        const option = document.createElement('option');
        option.value = directory;
        option.innerHTML = directory;

        if (last && last === directory) {
            option.selected = true;
        }

        $savedDirectories.appendChild(option);
    });
};

const appendConsoles = () => {
    const defaultConsoles = consoles.get();
    const lastConsole = storage.getLastConsole();

    for (con in defaultConsoles) {
        var option = document.createElement('option');
        option.value = con;
        option.innerHTML = con;

        if (lastConsole && lastConsole === con) {
            option.selected = true;
        }

        consoleList.appendChild(option);
    }
};

const checkForUpdates = () => {
  fetch('https://api.github.com/repos/wistcc/git-easy/tags')
    .then(response => { return response.json(); })
    .then(data => {
        //TODO: get the correct version number and compare which is greater. Semver compare.
        if (!data[0].name.includes(version)) {
            $updateAvailable.classList.remove('hidden');
        }
  });
};

const getFilteredSubdirectories = (sub, filter) => {
    const regx = new RegExp(filter, 'i');
    return sub.filter(s => regx.test(s.folder));
}

// When main-window is hidden, reset filter
ipcRenderer.on('clear-filter', () => {
    dirFilter = '';
    $filter.innerHTML = dirFilter;
    printSubdirectories();
});

module.exports = {
    init,
    appendConsoles,
    appendSavedDirectories,
    appendDirectories,
    printSubdirectories,
    checkForUpdates,
};
