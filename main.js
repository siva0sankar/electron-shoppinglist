const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready 
app.on('ready', function () {
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    // load HTML file inside window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    // file://dirname/mainWindow.html

    // Quit App when close
    mainWindow.on('closed', function () {
        app.quit();
    })

    // Build a menu from temlpate
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

});

// Handle craete add window
function craeteAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });
    // load HTML file inside window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    });
}

// Catch item add
ipcMain.on('item:add', function (e, item) {
    console.log(item)
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create Menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    craeteAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

// If mac add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add dev tool not in production env
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tool',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Toggle DevTool',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(Item, fousedWindow) {
                    fousedWindow.toggleDevTools();
                }
            }
        ]
    })
}