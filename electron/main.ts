import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'
import net from 'net'

// 未签名应用需要禁用沙箱，否则 GPU/网络进程无法启动
app.commandLine.appendSwitch('no-sandbox')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const API_PORT = 35490

let mainWindow: BrowserWindow | null = null
let lyricWindow: BrowserWindow | null = null
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
    const { serveNcmApi } = require('@neteasecloudmusicapienhanced/api')
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

// ===== 桌面歌词窗口 =====
function createLyricWindow() {
  if (lyricWindow) {
    lyricWindow.show()
    return
  }

  const display = screen.getPrimaryDisplay()
  const { width: screenW } = display.workAreaSize

  lyricWindow = new BrowserWindow({
    width: 800,
    height: 120,
    x: Math.floor((screenW - 800) / 2),
    y: display.workAreaSize.height - 160,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  // 允许点击穿透，但鼠标进入歌词区域时取消穿透
  lyricWindow.setIgnoreMouseEvents(true, { forward: true })

  if (isDev) {
    lyricWindow.loadURL('http://localhost:5173/desktop-lyric.html')
  } else {
    lyricWindow.loadFile(path.join(__dirname, '../dist/desktop-lyric.html'))
  }

  // 歌词窗口加载完毕后，等 Vue 挂载完再通知主窗口推送数据
  lyricWindow.webContents.on('did-finish-load', () => {
    // 延迟 500ms 确保 Vue 组件已 mount 并注册了 IPC listener
    setTimeout(() => {
      mainWindow?.webContents.send('desktop-lyric-ready')
    }, 500)
  })

  lyricWindow.on('closed', () => {
    lyricWindow = null
    // 通知主窗口桌面歌词已关闭
    mainWindow?.webContents.send('desktop-lyric-closed')
  })
}

function closeLyricWindow() {
  if (lyricWindow) {
    lyricWindow.close()
    lyricWindow = null
  }
}

// 窗口控制
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
})
ipcMain.on('window-close', () => mainWindow?.hide())
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false)

// 桌面歌词控制
ipcMain.on('toggle-desktop-lyric', (_event, show: boolean) => {
  if (show) {
    createLyricWindow()
  } else {
    closeLyricWindow()
  }
})

// 主窗口 -> 桌面歌词窗口：同步歌词数据
ipcMain.on('sync-lyric-data', (_event, data: any) => {
  if (lyricWindow && !lyricWindow.isDestroyed()) {
    lyricWindow.webContents.send('lyric-data-update', data)
  }
})

// 桌面歌词窗口请求关闭自己
ipcMain.on('close-desktop-lyric', () => {
  closeLyricWindow()
  mainWindow?.webContents.send('desktop-lyric-closed')
})

// 桌面歌词窗口鼠标事件：进入时取消穿透，离开时恢复穿透
ipcMain.on('lyric-mouse-enter', () => {
  lyricWindow?.setIgnoreMouseEvents(false)
})
ipcMain.on('lyric-mouse-leave', () => {
  lyricWindow?.setIgnoreMouseEvents(true, { forward: true })
})

// 桌面歌词拖动
ipcMain.on('lyric-window-move', (_event, deltaX: number, deltaY: number) => {
  if (lyricWindow) {
    const [x, y] = lyricWindow.getPosition()
    lyricWindow.setPosition(x + deltaX, y + deltaY)
  }
})

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
