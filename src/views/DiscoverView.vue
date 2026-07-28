<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getNewSongs, getRecommendPlaylists, getPlaylistSongs, formatDuration, formatPlayCount, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'

interface Playlist {
  id: number
  name: string
  cover: string
  playCount: number
}

const router = useRouter()
const store = usePlayerStore()
const keyword = ref('')
const playlists = ref<Playlist[]>([])
const songs = ref<Song[]>([])
const loading = ref(true)

function search() {
  const query = keyword.value.trim()
  if (query) router.push({ path: '/search', query: { q: query } })
}

function playSong(song: Song) {
  store.play(song)
}

async function onPlaylistClick(playlistId: number) {
  const songs = await getPlaylistSongs(playlistId)
  if (songs.length) store.playAll(songs)
}

onMounted(async () => {
  loading.value = true
  try {
    const [playlistData, songData] = await Promise.all([
      getRecommendPlaylists(12),
      getNewSongs(0),
    ])
    playlists.value = playlistData
    songs.value = songData.slice(0, 10)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="discover-view">
    <form class="discover-search search-box" @submit.prevent="search">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </svg>
      <input v-model="keyword" type="search" placeholder="搜索歌曲、歌手、专辑" aria-label="搜索音乐" />
    </form>

    <div v-if="loading" class="loading-wrap"><div class="spinner" /></div>

    <template v-else>
      <section class="music-section">
        <h1 class="section-title">推荐歌单</h1>
        <div class="playlist-grid">
          <article v-for="playlist in playlists" :key="playlist.id" class="grid-card" @click="onPlaylistClick(playlist.id)" style="cursor:pointer">
            <div class="cover">
              <img v-if="playlist.cover" :src="playlist.cover" :alt="playlist.name" />
              <div v-else class="cover-placeholder">♪</div>
              <button class="play-overlay" type="button" :aria-label="`播放歌单 ${playlist.name}`">
                <span class="play-button">▶</span>
              </button>
              <span class="play-count">▶ {{ formatPlayCount(playlist.playCount) }}</span>
            </div>
            <p class="title">{{ playlist.name }}</p>
            <p class="subtitle">{{ formatPlayCount(playlist.playCount) }} 次播放</p>
          </article>
        </div>
      </section>

      <section class="music-section new-songs-section">
        <h2 class="section-title">新歌推荐</h2>
        <div v-if="songs.length" class="song-list card">
          <div v-for="(song, index) in songs" :key="song.id" class="song-row" @click="playSong(song)">
            <span class="song-index" :class="{ top: index < 3 }">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="song-cover">
              <img v-if="song.cover" :src="song.cover" :alt="song.name" />
              <span v-else class="song-cover-placeholder">♪</span>
            </div>
            <div class="song-info">
              <p class="song-name">{{ song.name }}</p>
              <p class="song-artist">{{ song.artists }}</p>
            </div>
            <span class="song-duration">{{ formatDuration(song.duration) }}</span>
          </div>
        </div>
        <div v-else class="empty-state"><p class="empty-title">暂无新歌推荐</p></div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.discover-view { padding: 30px 40px 48px; }
.discover-search { width: min(520px, 100%); margin: 0 auto 38px; }
.loading-wrap { display: flex; justify-content: center; padding: 100px 0; }
.music-section + .music-section { margin-top: 42px; }
.section-title { margin: 0 0 18px; }
.playlist-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px 16px; }
.cover-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: var(--text-muted); font-size: 30px; }
.play-count { position: absolute; top: 8px; right: 8px; padding: 3px 7px; border-radius: 12px; background: rgba(0, 0, 0, .42); color: #fff; font-size: 11px; }
.play-overlay { border: 0; cursor: pointer; }
.play-button { display: grid; place-items: center; width: 42px; height: 42px; padding-left: 2px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 16px; }
.song-list { overflow: hidden; }
.song-row { border-radius: 0; }
.song-row + .song-row { border-top: 1px solid var(--border); }
@media (max-width: 1100px) { .playlist-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 720px) { .discover-view { padding: 24px 18px 40px; } .playlist-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; } }
</style>
