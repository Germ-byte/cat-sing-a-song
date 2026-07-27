import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron'
import path from 'path'
import net from 'net'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const API_PORT = 35490

let mainWindow: BrowserWindow | null = null
let isQuiting = false

// 检测端口是否可用
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

// 启动内嵌的网易云音乐 API 服务
async function startMusicApiServer() {
  try {
    const available = await isPortAvailable(API_PORT)
    if (!available) {
      console.log(`⚡ 端口 ${API_PORT} 已被占用，API 服务可能已在运行，跳过启动`)
      return
    }
    const { serveNcmApi } = require('NeteaseCloudMusicApi')
    await serveNcmApi({
      port: API_PORT,
      host: '127.0.0.1',
    })
    console.log(`✅ 音乐API服务已启动: http://127.0.0.1:${API_PORT}`)
  } catch (e: any) {
    console.warn('API服务启动异常:', e.message)
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
