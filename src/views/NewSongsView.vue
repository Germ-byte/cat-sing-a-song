<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getNewSongs, formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import { useFavoritesStore } from '@/stores/favorites'

const store = usePlayerStore()
const favorites = useFavoritesStore()
const openMenuSongId = ref<number | null>(null)
const categories = [
  { label: '全部', type: 0 },
  { label: '华语', type: 7 },
  { label: '欧美', type: 96 },
  { label: '日语', type: 8 },
  { label: '韩语', type: 16 },
]
const activeType = ref(0)
const songs = ref<Song[]>([])
const loading = ref(false)

async function loadSongs() {
  loading.value = true
  try {
    songs.value = await getNewSongs(activeType.value)
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

function addSong(song: Song) {
  store.addToPlaylist(song)
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

watch(activeType, loadSongs)
onMounted(loadSongs)
</script>

<template>
  <main class="new-songs-view" @click="closeMenu">
    <header class="page-header">
      <div>
        <h1>新歌速递</h1>
        <p>聆听最新发布的好音乐</p>
      </div>
      <button class="play-all" type="button" :disabled="!songs.length" @click="playAll">
        <span>▶</span> 播放全部
      </button>
    </header>

    <nav class="tab-bar" aria-label="新歌分类">
      <button
        v-for="category in categories"
        :key="category.type"
        class="tab-item"
        :class="{ active: activeType === category.type }"
        type="button"
        @click="activeType = category.type"
      >
        {{ category.label }}
      </button>
    </nav>

    <div v-if="loading" class="loading-wrap"><div class="spinner" /></div>
    <div v-else-if="songs.length" class="song-list card">
      <div v-for="(song, index) in songs" :key="song.id" class="song-row" @dblclick="playSong(song)" @click="playSong(song)">
        <span class="song-index" :class="{ top: index < 3 }">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="song-cover">
          <img v-if="song.cover" :src="song.cover" :alt="song.name" />
          <span v-else class="song-cover-placeholder">♪</span>
        </div>
        <div class="song-info">
          <p class="song-name">{{ song.name }}</p>
          <p class="song-artist">{{ song.artists }}</p>
        </div>
        <span class="song-album">{{ song.album }}</span>
        <div class="fav-wrap relative" @click.stop>
          <button class="fav-button" type="button" aria-label="收藏到歌单" @click="toggleMenu(song.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" :fill="openMenuSongId === song.id ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
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
        <button class="add-button" type="button" aria-label="添加到播放列表" @click.stop="addSong(song)">+</button>
        <span class="song-duration">{{ formatDuration(song.duration) }}</span>
      </div>
    </div>
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
      <p class="empty-title">暂无新歌</p>
      <p class="empty-sub">换个分类试试看</p>
    </div>
  </main>
</template>

<style scoped>
.new-songs-view { padding: 30px 40px 48px; }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
h1 { margin: 0; color: var(--text-primary); font-size: 28px; font-weight: 700; }
.page-header p { margin: 8px 0 0; color: var(--text-muted); font-size: 13px; }
.play-all { display: inline-flex; align-items: center; gap: 8px; padding: 10px 17px; border: 0; border-radius: var(--radius-xl); background: var(--accent); color: #fff; cursor: pointer; font-size: 14px; transition: var(--transition); }
.play-all:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 16px var(--accent-glow); }
.play-all:disabled { opacity: .45; cursor: not-allowed; }
.tab-bar { width: max-content; max-width: 100%; margin-bottom: 24px; overflow-x: auto; }
.loading-wrap { display: flex; justify-content: center; padding: 100px 0; }
.song-list { overflow: hidden; }
.song-row { border-radius: 0; }
.song-row + .song-row { border-top: 1px solid var(--border); }
.add-button { width: 26px; height: 26px; border: 1px solid var(--border-light); border-radius: 50%; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 19px; line-height: 1; opacity: 0; transition: var(--transition); }
.song-row:hover .add-button { opacity: 1; }
.add-button:hover { border-color: var(--accent); color: var(--accent); }
@media (max-width: 720px) { .new-songs-view { padding: 24px 18px 40px; } .song-album, .add-button, .fav-wrap { display: none; } }

.fav-wrap { flex-shrink: 0; }
.fav-button { width: 26px; height: 26px; border: 1px solid var(--border-light); border-radius: 50%; background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: var(--transition); }
.song-row:hover .fav-button { opacity: 1; }
.fav-button:hover { border-color: var(--accent); color: var(--accent); }
.fav-menu {
  position: absolute;
  right: 0;
  top: 32px;
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
