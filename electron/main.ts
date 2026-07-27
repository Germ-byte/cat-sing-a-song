import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow: BrowserWindow | null = null
let isQuiting = false

// 启动内嵌的网易云音乐 API 服务
async function startMusicApiServer() {
  try {
    const { serveNcmApi } = require('NeteaseCloudMusicApi')
    await serveNcmApi({
      port: 35490,
      host: '127.0.0.1',
    })
    console.log('✅ 音乐API服务已启动: http://127.0.0.1:35490')
  } catch (e: any) {
    // 如果 serveNcmApi 不存在，尝试其他启动方式
    console.warn('serveNcmApi not found, trying alternative...', e.message)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0c1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

// 窗口控制
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
})
ipcMain.on('window-close', () => mainWindow?.hide())
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false)

app.whenReady().then(async () => {
  await startMusicApiServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

app.on('before-quit', () => { isQuiting = true })
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
