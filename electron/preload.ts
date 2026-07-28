import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // 桌面歌词
  toggleDesktopLyric: (show: boolean) => ipcRenderer.send('toggle-desktop-lyric', show),
  syncLyricData: (data: any) => ipcRenderer.send('sync-lyric-data', data),
  closeDesktopLyric: () => ipcRenderer.send('close-desktop-lyric'),
  onDesktopLyricClosed: (callback: () => void) => {
    ipcRenderer.on('desktop-lyric-closed', callback)
    return () => ipcRenderer.removeListener('desktop-lyric-closed', callback)
  },
  onDesktopLyricReady: (callback: () => void) => {
    ipcRenderer.on('desktop-lyric-ready', callback)
    return () => ipcRenderer.removeListener('desktop-lyric-ready', callback)
  },

  // 桌面歌词窗口内部使用
  onLyricDataUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('lyric-data-update', (_event, data) => callback(data))
    return () => ipcRenderer.removeAllListeners('lyric-data-update')
  },
  lyricMouseEnter: () => ipcRenderer.send('lyric-mouse-enter'),
  lyricMouseLeave: () => ipcRenderer.send('lyric-mouse-leave'),
  lyricWindowMove: (deltaX: number, deltaY: number) => ipcRenderer.send('lyric-window-move', deltaX, deltaY),
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      toggleDesktopLyric: (show: boolean) => void
      syncLyricData: (data: any) => void
      closeDesktopLyric: () => void
      onDesktopLyricClosed: (callback: () => void) => () => void
      onDesktopLyricReady: (callback: () => void) => () => void
      onLyricDataUpdate: (callback: (data: any) => void) => () => void
      lyricMouseEnter: () => void
      lyricMouseLeave: () => void
      lyricWindowMove: (deltaX: number, deltaY: number) => void
    }
  }
}
