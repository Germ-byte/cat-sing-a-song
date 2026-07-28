/** Electron preload 暴露的 API 类型声明 */
export {}

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
