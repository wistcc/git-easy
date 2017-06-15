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