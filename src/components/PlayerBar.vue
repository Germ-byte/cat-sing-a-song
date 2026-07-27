<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { storeToRefs } from 'pinia'
import { formatDuration } from '@/api/music'

const store = usePlayerStore()
const { currentSong, isPlaying, currentTime, duration, volume, isMuted, playMode, progress, showLyric } = storeToRefs(store)

const timeText = computed(() => formatDuration(currentTime.value * 1000))
const durationText = computed(() => formatDuration(duration.value * 1000))

const modeLabel = computed(() => {
  const m: Record<string, string> = { sequence: '顺序', loop: '循环', random: '随机', single: '单曲' }
  return m[playMode.value] || ''
})

function onProgressClick(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  store.seek(((e.clientX - rect.left) / rect.width) * duration.value)
}
</script>

<template>
  <footer class="player-bar">
    <!-- 左：歌曲信息 -->
    <div class="player-song">
      <div class="player-cover" :class="{ spinning: isPlaying }">
        <img v-if="currentSong?.cover" :src="currentSong.cover" alt="" />
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="var(--text-muted)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <div class="player-meta" v-if="currentSong">
        <div class="player-name">{{ currentSong.name }}</div>
        <div class="player-artist">{{ currentSong.artists }}</div>
      </div>
      <div class="player-meta" v-else>
        <div class="player-name" style="color:var(--text-muted)">未播放</div>
      </div>
    </div>

    <!-- 中：控制按钮 + 进度 -->
    <div class="player-controls">
      <div class="ctrl-buttons">
        <button class="icon-btn icon-btn-sm" @click="store.toggleMode" :title="modeLabel">
          <svg v-if="playMode==='sequence'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else-if="playMode==='loop'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          <svg v-else-if="playMode==='random'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/><text x="10" y="14" font-size="8" fill="currentColor" stroke="none">1</text></svg>
        </button>
        <button class="icon-btn" @click="store.playPrev">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="play-btn" @click="store.togglePlay">
          <svg v-if="!isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="icon-btn" @click="store.playNext">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>
      <div class="progress-row">
        <span class="time-label">{{ timeText }}</span>
        <div class="progress-track" @click="onProgressClick">
          <div class="progress-fill" :style="{ width: progress + '%' }">
            <div class="progress-thumb"></div>
          </div>
        </div>
        <span class="time-label">{{ durationText }}</span>
      </div>
    </div>

    <!-- 右：歌词与音量 -->
    <div class="player-right">
      <button
        class="lyric-toggle"
        :class="{ active: showLyric }"
        title="歌词"
        @click="store.toggleLyric"
      >
        词
      </button>
      <button class="icon-btn icon-btn-sm" @click="store.toggleMute">
        <svg v-if="isMuted || volume===0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
      </button>
      <input type="range" min="0" max="100" :value="isMuted?0:volume" @input="store.setVolume(Number(($event.target as HTMLInputElement).value))" class="volume-slider" />
    </div>
  </footer>
</template>

<style scoped>
.player-bar {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  background: var(--bg-player);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

/* 左 */
.player-song {
  width: 240px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.player-cover {
  width: 48px; height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-card);
  display: flex; align-items: center; justify-content: center;
}
.player-cover.spinning {
  border-radius: 50%;
  animation: spin 12s linear infinite;
}
.player-cover img {
  width: 100%; height: 100%; object-fit: cover;
}
.player-meta { min-width: 0; }
.player-name {
  font-size: 14px; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.player-artist {
  font-size: 12px; color: var(--text-muted); margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* 中 */
.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 600px;
  margin: 0 auto;
}
.ctrl-buttons {
  display: flex; align-items: center; gap: 12px;
}
.play-btn {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}
.play-btn:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 20px var(--accent-glow);
}

.progress-row {
  width: 100%;
  display: flex; align-items: center; gap: 8px;
}
.time-label {
  font-size: 11px; color: var(--text-muted); width: 40px; text-align: center; flex-shrink: 0;
}
.progress-track {
  flex: 1; height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}
.progress-track:hover { height: 6px; }
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  position: relative;
  transition: width 0.1s linear;
}
.progress-thumb {
  position: absolute; right: -5px; top: 50%; transform: translateY(-50%);
  width: 10px; height: 10px;
  border-radius: 50%; background: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}
.progress-track:hover .progress-thumb { opacity: 1; }

/* 右 */
.player-right {
  width: 160px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; justify-content: flex-end;
}
.lyric-toggle {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}
.lyric-toggle:hover,
.lyric-toggle.active {
  border-color: var(--accent);
  background: var(--accent-glow);
  color: var(--accent);
}
.volume-slider {
  width: 90px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
