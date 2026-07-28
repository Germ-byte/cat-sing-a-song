import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

/**
 * 自定义插件：移除 HTML 中的 crossorigin 属性
 * Electron 使用 file:// 协议加载页面，crossorigin 属性会导致 CORS 错误
 * 导致 JS/CSS 全部无法加载，页面空白
 */
function removeCrossorigin(): Plugin {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '')
    },
  }
}

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // 关闭 modulePreload polyfill，避免产生带 crossorigin 的 link 标签
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'desktop-lyric': path.resolve(__dirname, 'desktop-lyric.html'),
      },
    },
  },
  plugins: [
    vue(),
    removeCrossorigin(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', '@neteasecloudmusicapienhanced/api'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  server: {
    port: 5173,
  },
})
