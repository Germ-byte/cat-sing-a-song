<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAlbumDetail, formatDuration, type Song, type AlbumInfo } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const store = usePlayerStore()
const favorites = useFavoritesStore()

const loading = ref(false)
const info = ref<AlbumInfo | null>(null)
const songs = ref<Song[]>([])
const openMenuSongId = ref<number | null>(null)

const albumId = computed(() => Number(route.params.id))

async function load() {
  if (!albumId.value) return
  loading.value = true
  openMenuSongId.value = null
  try {
    const result = await getAlbumDetail(albumId.value)
    info.value = result.info
    songs.value = result.songs
  } catch (e) {
    console.error('加载专辑失败:', e)
  } finally {
    loading.value = false
  }
}

function playSong(song: Song) {
  store.play(song)
}

function playAll() {
  if (songs.value.length) store.playAll(songs.value)
}

function toggleMenu(songId: number) {
  openMenuSongId.value = openMenuSongId.value === songId ? null : songId
}

function closeMenu() {
  openMenuSongId.value = null
}

function addToFavorite(song: Song, playlistId: string) {
  favorites.addSongToPlaylist(playlistId, song)
  closeMenu()
}

function createAndAdd(song: Song) {
  const name = window.prompt('请输入新歌单名称', '新建歌单')
  if (name === null) return
  const trimmed = name.trim()
  if (!trimmed) return
  const playlist = favorites.createPlaylist(trimmed)
  favorites.addSongToPlaylist(playlist.id, song)
  closeMenu()
}

watch(albumId, load)
onMounted(load)
</script>

<template>
  <div class="album-view" @click="closeMenu">
    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <template v-else-if="info">
      <!-- header -->
      <div class="album-header">
        <div class="album-cover">
          <img v-if="info.cover" :src="info.cover" :alt="info.name" />
          <div v-else class="song-cover-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
          </div>
        </div>
        <div class="album-meta">
          <p class="album-label">专辑</p>
          <h1 class="album-name">{{ info.name }}</h1>
          <div class="album-sub">
            <span class="album-artist">{{ info.artist }}</span>
            <span class="dot">·</span>
            <span>{{ info.publishTime }}</span>
            <span class="dot">·</span>
            <span>{{ info.size }} 首歌曲</span>
          </div>
          <p v-if="info.description" class="album-desc">{{ info.description }}</p>
          <button class="btn-accent play-all-btn" :disabled="!songs.length" @click="playAll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            播放全部
          </button>
        </div>
      </div>

      <!-- song list -->
      <div v-if="songs.length" class="card song-list">
        <div
          v-for="(song, i) in songs"
          :key="song.id"
          class="song-row"
          @click="playSong(song)"
        >
          <span class="song-index">{{ i + 1 }}</span>
          <div class="song-info">
            <div class="song-name truncate">{{ song.name }}</div>
            <div class="song-artist truncate">{{ song.artists }}</div>
          </div>
          <span class="song-duration">{{ formatDuration(song.duration) }}</span>

          <div class="fav-wrap relative" @click.stop>
            <button
              class="icon-btn icon-btn-sm fav-btn"
              title="收藏到歌单"
              @click="toggleMenu(song.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="openMenuSongId === song.id ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            <div v-if="openMenuSongId === song.id" class="fav-menu card">
              <div class="fav-menu-title">添加到歌单</div>
              <div v-if="favorites.playlists.length" class="fav-menu-list">
                <button
                  v-for="playlist in favorites.playlists"
                  :key="playlist.id"
                  class="fav-menu-item"
                  @click="addToFavorite(song, playlist.id)"
                >
                  <span class="truncate">{{ playlist.name }}</span>
                  <span class="fav-menu-count">{{ playlist.songs.length }}</span>
                </button>
              </div>
              <div v-else class="fav-menu-empty">暂无歌单</div>
              <button class="fav-menu-create" @click="createAndAdd(song)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                新建歌单
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span class="empty-title">专辑暂无歌曲</span>
      </div>
    </template>

    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10" />
      </svg>
      <span class="empty-title">未找到专辑信息</span>
    </div>
  </div>
</template>

<style scoped>
.album-view {
  padding: 28px 32px;
  overflow-y: auto;
  height: 100%;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.album-header {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
}
.album-cover {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-hover);
  box-shadow: 0 8px 24px var(--shadow);
}
.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.album-cover .song-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.album-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.album-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.album-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}
.album-sub {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.album-artist {
  color: var(--accent);
}
.dot {
  color: var(--text-muted);
}
.album-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  max-width: 640px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.play-all-btn {
  width: max-content;
  margin-top: 12px;
}

.song-list {
  padding: 4px 0;
}

.fav-wrap {
  flex-shrink: 0;
}
.fav-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: var(--text-muted);
}
.song-row:hover .fav-btn,
.fav-btn.active {
  opacity: 1;
}
.fav-btn svg {
  color: inherit;
}

.fav-menu {
  position: absolute;
  right: 0;
  top: 36px;
  width: 220px;
  z-index: 20;
  padding: 8px;
  box-shadow: 0 8px 24px var(--shadow);
}
.fav-menu-title {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 8px 8px;
}
.fav-menu-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.fav-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: var(--transition);
}
.fav-menu-item:hover {
  background: var(--bg-hover);
}
.fav-menu-count {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.fav-menu-empty {
  padding: 12px 8px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
.fav-menu-create {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-light);
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition);
}
.fav-menu-create:hover {
  background: var(--bg-hover);
}
</style>
