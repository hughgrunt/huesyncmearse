// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');



//expose in renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getStreamSourceId : () => ipcRenderer.invoke('requestScreenCaptureSourceID'),
  writeFile : (filename, data) => ipcRenderer.invoke('receiveWriteFile', filename, data),
  readFile : (filename) => ipcRenderer.invoke('receiveReadFile', filename),
  setAlwaysOnTop : (bool) => ipcRenderer.send('setAlwaysOnTop', bool)

})
