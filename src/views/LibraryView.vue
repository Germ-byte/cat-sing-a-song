<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'

const store = usePlayerStore()
const { playlist, currentSong, currentIndex, isPlaying } = storeToRefs(store)

function playSong(index: number) {
  const song = playlist.value[index]
  if (song) store.play(song)
}
</script>

<template>
  <div class="library-view">
    <!-- header -->
    <div class="view-header">
      <div>
        <h1 class="section-title">播放列表</h1>
        <p class="view-subtitle">共 {{ playlist.length }} 首歌曲</p>
      </div>
      <button
        v-if="playlist.length"
        class="clear-btn"
        @click="store.clearPlaylist()"
      >清空列表</button>
    </div>

    <!-- song list -->
    <div v-if="playlist.length" class="card song-list">
      <div
        v-for="(song, i) in playlist"
        :key="`${song.id}-${i}`"
        class="song-row"
        :class="{ active: currentIndex === i }"
        @click="playSong(i)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <div class="song-cover relative">
          <img v-if="song.cover" :src="song.cover" :alt="song.name" />
          <div v-else class="song-cover-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <!-- playing indicator -->
          <div v-if="currentIndex === i && isPlaying" class="playing-indicator">
            <span class="bar"></span><span class="bar"></span><span class="bar"></span>
          </div>
        </div>
        <div class="song-info">
          <div class="song-name truncate" :class="{ active: currentIndex === i }">{{ song.name }}</div>
          <div class="song-artist truncate">{{ song.artists }}</div>
        </div>
        <span class="song-album">{{ song.album }}</span>
        <span class="song-duration">{{ formatDuration(song.duration) }}</span>
        <button
          class="icon-btn icon-btn-sm del-btn"
          title="移除"
          @click.stop="store.removeFromPlaylist(i)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- empty -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
      <span class="empty-title">播放列表为空</span>
      <span class="empty-sub">去发现音乐，添加你喜欢的歌曲吧</span>
    </div>
  </div>
</template>

<style scoped>
.library-view {
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
.del-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: var(--text-muted);
}
.del-btn:hover {
  color: #e06060;
  background: rgba(220, 80, 80, 0.12);
}
.song-row:hover .del-btn {
  opacity: 1;
}

/* playing indicator bars */
.playing-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-bottom: 10px;
  background: rgba(0,0,0,0.45);
  border-radius: inherit;
}
.playing-indicator .bar {
  width: 3px;
  background: #fff;
  border-radius: 1px;
  animation: eq 0.6s ease-in-out infinite alternate;
}
.playing-indicator .bar:nth-child(1) { height: 8px; animation-delay: 0s; }
.playing-indicator .bar:nth-child(2) { height: 14px; animation-delay: 0.2s; }
.playing-indicator .bar:nth-child(3) { height: 6px; animation-delay: 0.4s; }
@keyframes eq {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1); }
}
</style>
