<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getNewSongs, formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'

const store = usePlayerStore()
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

watch(activeType, loadSongs)
onMounted(loadSongs)
</script>

<template>
  <main class="new-songs-view">
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
@media (max-width: 720px) { .new-songs-view { padding: 24px 18px 40px; } .song-album, .add-button { display: none; } }
</style>
