<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'

const store = usePlayerStore()
const { playHistory, currentSong } = storeToRefs(store)
</script>

<template>
  <div class="history-view">
    <!-- header -->
    <div class="view-header">
      <div>
        <h1 class="section-title">历史播放</h1>
        <p class="view-subtitle">共 {{ playHistory.length }} 首歌曲</p>
      </div>
      <button
        v-if="playHistory.length"
        class="clear-btn"
        @click="store.clearHistory()"
      >清空历史</button>
    </div>

    <!-- song list -->
    <div v-if="playHistory.length" class="card song-list">
      <div
        v-for="(song, i) in playHistory"
        :key="`${song.id}-${i}`"
        class="song-row"
        :class="{ active: currentSong?.id === song.id }"
        @click="store.play(song)"
      >
        <span class="song-index">{{ i + 1 }}</span>
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
          <div class="song-name truncate" :class="{ active: currentSong?.id === song.id }">{{ song.name }}</div>
          <div class="song-artist truncate">{{ song.artists }}</div>
        </div>
        <span class="song-album">{{ song.album }}</span>
        <span class="song-duration">{{ formatDuration(song.duration) }}</span>
      </div>
    </div>

    <!-- empty -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <span class="empty-title">暂无播放历史</span>
      <span class="empty-sub">开始播放音乐，记录会显示在这里</span>
    </div>
  </div>
</template>

<style scoped>
.history-view {
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
.clear-btn {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(220, 80, 80, 0.4);
  background: transparent;
  color: #e06060;
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}
.clear-btn:hover {
  background: rgba(220, 80, 80, 0.12);
}
.song-list {
  padding: 4px 0;
}
</style>
