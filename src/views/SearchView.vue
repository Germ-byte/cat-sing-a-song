<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchSongs, formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const store = usePlayerStore()

const keyword = ref('')
const songs = ref<Song[]>([])
const total = ref(0)
const loading = ref(false)
const searched = ref(false)

async function search() {
  const q = keyword.value.trim()
  if (!q) return
  loading.value = true
  searched.value = true
  try {
    const result = await searchSongs(q)
    songs.value = result.songs
    total.value = result.total
  } catch (e) {
    console.error('搜索失败:', e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (q) => {
  if (q) {
    keyword.value = q as string
    search()
  }
})

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q as string
    search()
  }
})
</script>

<template>
  <div class="search-view">
    <!-- search input -->
    <div class="search-hero">
      <div class="search-box search-box-lg">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索歌曲、歌手、专辑..."
          @keyup.enter="search"
        />
        <button class="search-btn btn-accent" @click="search">搜索</button>
      </div>
    </div>

    <!-- loading -->
    <div v-if="loading" class="empty-state">
      <div class="spinner"></div>
    </div>

    <!-- results -->
    <template v-else-if="songs.length">
      <p class="result-count">
        找到 <span class="accent-text">{{ total }}</span> 首相关歌曲
      </p>
      <div class="card song-list">
        <div
          v-for="song in songs"
          :key="song.id"
          class="song-row"
          @click="store.play(song)"
        >
          <div class="song-cover relative">
            <img v-if="song.cover" :src="song.cover" :alt="song.name" />
            <div v-else class="song-cover-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="play-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="song-info">
            <div class="song-name truncate">{{ song.name }}</div>
            <div class="song-artist truncate">{{ song.artists }}</div>
          </div>
          <span class="song-album">{{ song.album }}</span>
          <span class="song-duration">{{ formatDuration(song.duration) }}</span>
          <button
            class="icon-btn icon-btn-sm add-btn"
            title="添加到播放列表"
            @click.stop="store.addToPlaylist(song)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- empty after search -->
    <div v-else-if="searched && !loading" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span class="empty-title">未找到相关歌曲</span>
      <span class="empty-sub">试试其他关键词</span>
    </div>

    <!-- initial state -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span class="empty-title">输入关键词开始搜索</span>
      <span class="empty-sub">支持歌曲名、歌手名、专辑名搜索</span>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  padding: 28px 32px;
  overflow-y: auto;
  height: 100%;
}
.search-hero {
  margin-bottom: 24px;
}
.search-box-lg input {
  height: 48px;
  font-size: 16px;
  padding-left: 42px;
  padding-right: 88px;
}
.search-box-lg .search-icon {
  width: 20px;
  height: 20px;
  left: 14px;
}
.search-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 18px;
  font-size: 13px;
}
.result-count {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.accent-text {
  color: var(--accent);
  font-weight: 600;
}
.song-list {
  padding: 4px 0;
}
.add-btn {
  opacity: 0;
  transition: opacity 0.2s;
}
.song-row:hover .add-btn {
  opacity: 1;
}
</style>
