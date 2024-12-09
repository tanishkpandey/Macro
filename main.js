const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 300, // Initial width
        resizable: true, // Prevent resizing by the user
        alwaysOnTop: true,
        frame: false, // Hides default window frame
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    // Adjust the window height dynamically after the content is loaded
    ipcMain.on('adjust-height', (event, height) => {
        mainWindow.setBounds({
            x: mainWindow.getBounds().x,
            y: mainWindow.getBounds().y,
            width: mainWindow.getBounds().width, // Keep the width constant
            height: height, // Dynamically adjust the height
        });
    });

    ipcMain.on('set-opacity', (event, opacity) => {
        mainWindow.setOpacity(opacity);
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for window actions
ipcMain.handle('close-window', () => {
    mainWindow.close();
});

ipcMain.handle('minimize-to-tray', () => {
    mainWindow.minimize();
});
