<script setup lang="ts">
</script>
<template>
  <div class="layout">
    <!-- 顶部标题栏 (macOS拖拽区) -->
    <header class="titlebar">
      <div class="titlebar-drag"></div>
      <span class="titlebar-title">CatDesk Music</span>
    </header>

    <div class="layout-body">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span class="logo-text">Music</span>
        </div>

        <nav class="sidebar-nav">
          <router-link to="/discover" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></svg>
            <span>推荐</span>
          </router-link>
          <router-link to="/new-songs" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span>新歌速递</span>
          </router-link>
          <router-link to="/rank" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>排行榜</span>
          </router-link>
        </nav>

        <div class="sidebar-divider"></div>
        <div class="sidebar-section-label">我的音乐</div>

        <nav class="sidebar-nav">
          <router-link to="/library" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15V5a2 2 0 00-2-2H9"/><polyline points="17 21 12 16 7 21"/></svg>
            <span>播放列表</span>
          </router-link>
          <router-link to="/favorites" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <span>我的歌单</span>
          </router-link>
          <router-link to="/history" class="nav-item" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>历史播放</span>
          </router-link>
        </nav>
      </aside>

      <!-- 主内容 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 底部播放栏 -->
    <PlayerBar />
  </div>
</template>

<script lang="ts">
import PlayerBar from './PlayerBar.vue'
export default { components: { PlayerBar } }
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 标题栏 */
.titlebar {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border);
  position: relative;
  flex-shrink: 0;
}
.titlebar-drag {
  position: absolute;
  inset: 0;
  -webkit-app-region: drag;
}
.titlebar-title {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  pointer-events: none;
}

/* 主体 */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 20px;
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
  cursor: pointer;
}
.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
}
.nav-item.active svg {
  stroke: #fff;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 8px;
}

.sidebar-section-label {
  font-size: 11px;
  color: var(--text-muted);
  padding: 0 12px 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 主内容 */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>
