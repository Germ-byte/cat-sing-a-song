# CatDesk Music 🎵

一个基于 Electron + Vue 3 + TypeScript 的跨平台个人音乐客户端。

## ✨ 特性

- 🎵 **多平台音乐聚合** - 支持网易云、QQ音乐、酷狗、酷我四大平台
- 🔍 **全网搜索** - 一键搜索所有平台音乐资源
- 🆕 **新歌速递** - 实时获取各平台最新发布歌曲
- 📊 **排行榜** - 热歌榜、新歌榜实时更新
- 🎨 **精美界面** - 现代化UI设计，支持深色模式
- 💾 **本地曲库** - 管理你的播放列表
- 📜 **播放历史** - 自动记录播放历史
- 🎛️ **播放控制** - 播放模式、进度、音量控制

## 🛠️ 技术栈

- **框架**: Electron + Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: UnoCSS
- **UI组件**: Naive UI

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 构建打包

```bash
npm run electron:build
```

## 📁 项目结构

```
catdesk-music/
├── electron/          # Electron 主进程
│   ├── main.ts        # 主进程入口
│   └── preload.ts     # 预加载脚本
├── src/               # 渲染进程（Vue）
│   ├── api/           # API 服务
│   ├── components/    # 公共组件
│   ├── views/         # 页面视图
│   ├── stores/        # Pinia 状态管理
│   ├── router/        # 路由配置
│   └── assets/        # 静态资源
├── resources/         # 应用资源（图标等）
└── package.json
```

## ⚠️ 免责声明

本项目仅供学习交流使用，请尊重音乐版权，支持正版音乐。

## 📄 License

MIT
