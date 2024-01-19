const { app, BrowserWindow, ipcMain, dialog, desktopCapturer, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('node:fs');
//readFile and resolve for readingFiles
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');


app.commandLine.appendSwitch("disable-renderer-backgrounding");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

var mainWindow = null;
var tray = null;
var KillApp = false;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon:  path.join(__dirname, 'icon.png'),
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    //alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      devTools: true
    },
  });

  // Prevent window from closing and quitting app
    // Instead make close simply hide main window
    // Clicking on tray icon will bring back main window
    mainWindow.on('close', (event) =>
    {
      if (!KillApp)
      {
        event.preventDefault();
        mainWindow.hide();
      }
    });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
//whenReady
app.whenReady().then(() => {
ipcMain.handle('requestScreenCaptureSourceID', handleRequestScreenCaptureSourceID);
ipcMain.handle('receiveWriteFile', handleWriteFile);
ipcMain.handle('receiveReadFile', handleReadFile);
ipcMain.on('setAlwaysOnTop', handleSetAlwaysOnTop);
const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
        {
            label: 'show', click: function () {
                mainWindow.restore();
            }
        },
        {
            label: 'quit', click: function () {
              KillApp = true;
              app.quit();
            }
        }
    ]);

  tray.setToolTip('Hue Sync Me Arse');
  tray.setContextMenu(contextMenu);
})

// SSL/TSL: this is the self signed certificate support
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function MinimizeInsteadOfQuit(minimize)
{
  console.log("Should i minize: " + minimize);
  if (minimize)
  {
    mainWindow.onclose =
    mainWindow.hide();
    return;
  }
  app.quit();

}

async function handleRequestScreenCaptureSourceID()
{
  const [source] = await desktopCapturer.getSources({ types: ['window', 'screen'], fetchWindowIcons: true });
  return source.id;
}

async function handleWriteFile(event, filename, data)
{
  let success = false;
  await fs.writeFile(path.join(__dirname, filename), data, function (err)
  {
  if (err) throw err;
  }
  );
  success = true;
  return success;
}

async function handleReadFile(event, filename)
{
  try
  {
    let filepath = resolve(path.join(__dirname, filename));
    let filecontent = await readFile(filepath, {encoding: 'utf8'});
    return filecontent;
  }
  catch (err)
  {
    return err;
  }
  return "someting went wrong";
}

async function handleSetAlwaysOnTop(event, bool)
{
  mainWindow.setAlwaysOnTop(bool);
}
