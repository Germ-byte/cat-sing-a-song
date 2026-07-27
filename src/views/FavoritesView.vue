<script setup lang="ts">
import { ref } from 'vue'
import { formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore, type FavoritePlaylist } from '@/stores/favorites'

const store = usePlayerStore()
const favorites = useFavoritesStore()

const expandedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function createPlaylist() {
  const name = window.prompt('请输入歌单名称', '新建歌单')
  if (name === null) return
  const trimmed = name.trim()
  if (!trimmed) return
  const playlist = favorites.createPlaylist(trimmed)
  expandedId.value = playlist.id
}

function renamePlaylist(playlist: FavoritePlaylist) {
  const name = window.prompt('重命名歌单', playlist.name)
  if (name === null) return
  const trimmed = name.trim()
  if (!trimmed) return
  favorites.renamePlaylist(playlist.id, trimmed)
}

function deletePlaylist(playlist: FavoritePlaylist) {
  const ok = window.confirm(`确定要删除歌单「${playlist.name}」吗？此操作不可撤销。`)
  if (!ok) return
  favorites.deletePlaylist(playlist.id)
  if (expandedId.value === playlist.id) expandedId.value = null
}

function playAll(playlist: FavoritePlaylist) {
  if (playlist.songs.length) store.playAll(playlist.songs)
}

function playSong(song: Song) {
  store.play(song)
}

function removeSong(playlist: FavoritePlaylist, song: Song) {
  favorites.removeSongFromPlaylist(playlist.id, song.id)
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<template>
  <div class="favorites-view">
    <!-- header -->
    <div class="view-header">
      <div>
        <h1 class="section-title">我的歌单</h1>
        <p class="view-subtitle">共 {{ favorites.playlists.length }} 个歌单</p>
      </div>
      <button class="btn-accent" @click="createPlaylist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        新建歌单
      </button>
    </div>

    <!-- playlists -->
    <div v-if="favorites.playlists.length" class="playlist-list">
      <div v-for="playlist in favorites.playlists" :key="playlist.id" class="card playlist-card">
        <div class="playlist-header" @click="toggleExpand(playlist.id)">
          <svg
            class="expand-icon"
            :class="{ open: expandedId === playlist.id }"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <div class="playlist-cover">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <div class="playlist-info">
            <div class="playlist-name truncate">{{ playlist.name }}</div>
            <div class="playlist-meta">{{ playlist.songs.length }} 首歌曲 · 创建于 {{ formatDate(playlist.createdAt) }}</div>
          </div>
          <div class="playlist-actions" @click.stop>
            <button
              class="icon-btn icon-btn-sm"
              title="播放全部"
              :disabled="!playlist.songs.length"
              @click="playAll(playlist)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <button class="icon-btn icon-btn-sm" title="重命名" @click="renamePlaylist(playlist)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button class="icon-btn icon-btn-sm del-btn" title="删除歌单" @click="deletePlaylist(playlist)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <!-- expanded songs -->
        <div v-if="expandedId === playlist.id" class="playlist-songs">
          <div v-if="playlist.songs.length" class="song-list">
            <div
              v-for="(song, i) in playlist.songs"
              :key="song.id"
              class="song-row"
              @click="playSong(song)"
            >
              <span class="song-index">{{ i + 1 }}</span>
              <div class="song-cover relative">
                <img v-if="song.cover" :src="song.cover" :alt="song.name" />
                <div v-else class="song-cover-placeholder">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                </div>
                <div class="play-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div class="song-info">
                <div class="song-name truncate">{{ song.name }}</div>
                <div class="song-artist truncate">{{ song.artists }}</div>
              </div>
              <span class="song-album">{{ song.album }}</span>
              <span class="song-duration">{{ formatDuration(song.duration) }}</span>
              <button
                class="icon-btn icon-btn-sm del-btn song-del-btn"
                title="从歌单移除"
                @click.stop="removeSong(playlist, song)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="playlist-empty">歌单还是空的，去搜索或新歌页面添加歌曲吧</div>
        </div>
      </div>
    </div>

    <!-- empty -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      <span class="empty-title">还没有收藏歌单</span>
      <span class="empty-sub">点击右上角新建歌单，开始收藏你喜欢的歌曲</span>
    </div>
  </div>
</template>

<style scoped>
.favorites-view {
  padding: 28px 32px;
  overflow-y: auto;
  height: 100%;
}
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.view-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playlist-card {
  overflow: hidden;
}

.playlist-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: var(--transition);
}
.playlist-header:hover {
  background: var(--bg-hover);
}

.expand-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}
.expand-icon.open {
  transform: rotate(90deg);
}

.playlist-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}
.playlist-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.playlist-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

.playlist-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.del-btn:hover {
  color: #e06060;
  background: rgba(220, 80, 80, 0.12);
}

.playlist-songs {
  border-top: 1px solid var(--border);
  padding: 4px 0;
}
.playlist-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.song-list {
  padding: 4px 0;
}
.song-del-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: var(--text-muted);
}
.song-row:hover .song-del-btn {
  opacity: 1;
}
</style>
