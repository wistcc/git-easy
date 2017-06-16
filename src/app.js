const documentHelper = require('./src/helpers/document');

documentHelper.init();
documentHelper.appendConsoles();
documentHelper.appendSavedDirectories();
documentHelper.appendDirectories();
documentHelper.printSubdirectories();

if (process.env.NODE_ENV !== 'development') {
    documentHelper.checkForUpdates();
}
