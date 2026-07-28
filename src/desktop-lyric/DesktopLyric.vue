<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface LyricLine {
  time: number
  text: string
}

// ===== 歌词解析（内联，不依赖外部模块） =====
function parseLrc(lrcText: string): LyricLine[] {
  const lines: LyricLine[] = []
  const re = /\[(\d+):(\d+(?:\.\d+)?)\]/g
  for (const raw of lrcText.split(/\r?\n/)) {
    const timestamps = [...raw.matchAll(re)]
    const text = raw.replace(re, '').trim()
    if (!text || timestamps.length === 0) continue
    for (const m of timestamps) {
      const t = Number(m[1]) * 60 + Number(m[2])
      if (Number.isFinite(t)) lines.push({ time: t, text })
    }
  }
  return lines.sort((a, b) => a.time - b.time)
}

function findCurrentLine(lines: LyricLine[], time: number): number {
  let idx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time > time) break
    idx = i
  }
  return idx
}

// ===== 状态 =====
const lyrics = ref<LyricLine[]>([])
const currentTime = ref(0)
const songId = ref(0)
const songName = ref('')
const artistName = ref('')
const isPlaying = ref(false)

const fontSize = ref(28)
const MIN_FONT = 16
const MAX_FONT = 48

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

const isHovered = ref(false)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

// 当前歌词行
const currentLineIdx = computed(() => findCurrentLine(lyrics.value, currentTime.value))
const currentLyric = computed(() => lyrics.value[currentLineIdx.value]?.text || '')
const nextLyric = computed(() => lyrics.value[currentLineIdx.value + 1]?.text || '')

// ===== 自己请求歌词 =====
async function fetchLyrics(id: number) {
  lyrics.value = []
  if (!id) return
  try {
    const resp = await fetch(`http://127.0.0.1:35490/lyric?id=${id}`)
    const data = await resp.json()
    const lrcText = data?.lrc?.lyric || ''
    lyrics.value = parseLrc(lrcText)
    console.log('[DesktopLyric] 歌词加载完成, lines:', lyrics.value.length)
  } catch (e) {
    console.error('[DesktopLyric] 歌词加载失败:', e)
  }
}

// songId 变化时重新加载歌词
watch(songId, (newId) => {
  if (newId > 0) fetchLyrics(newId)
})

// ===== IPC：只接收 songId / currentTime / isPlaying =====
let cleanupListener: (() => void) | null = null

onMounted(() => {
  if (window.electronAPI?.onLyricDataUpdate) {
    cleanupListener = window.electronAPI.onLyricDataUpdate((data: any) => {
      if (data.songId !== undefined && data.songId !== songId.value) {
        songId.value = data.songId
        songName.value = data.songName || ''
        artistName.value = data.artistName || ''
      }
      if (data.currentTime !== undefined) {
        currentTime.value = data.currentTime
      }
      if (data.isPlaying !== undefined) {
        isPlaying.value = data.isPlaying
      }
      // 兼容：如果推了歌曲名但没换歌
      if (data.songName !== undefined) songName.value = data.songName
      if (data.artistName !== undefined) artistName.value = data.artistName
    })
  }
})

onUnmounted(() => { cleanupListener?.() })

// ===== 交互 =====
function zoomIn() { fontSize.value = Math.min(MAX_FONT, fontSize.value + 2) }
function zoomOut() { fontSize.value = Math.max(MIN_FONT, fontSize.value - 2) }

function onMouseEnter() {
  isHovered.value = true
  if (hoverTimer) clearTimeout(hoverTimer)
  window.electronAPI?.lyricMouseEnter()
}

function onMouseLeave() {
  if (!isDragging.value) {
    hoverTimer = setTimeout(() => {
      isHovered.value = false
      window.electronAPI?.lyricMouseLeave()
    }, 300)
  }
}

function onDragStart(e: MouseEvent) {
  isDragging.value = true
  dragStartX.value = e.screenX
  dragStartY.value = e.screenY
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  if (!isDragging.value) return
  const dx = e.screenX - dragStartX.value
  const dy = e.screenY - dragStartY.value
  dragStartX.value = e.screenX
  dragStartY.value = e.screenY
  window.electronAPI?.lyricWindowMove(dx, dy)
}

function onDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

function closeLyric() { window.electronAPI?.closeDesktopLyric() }

function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.deltaY < 0) zoomIn(); else zoomOut()
}
</script>

<template>
  <div
    class="desktop-lyric-container"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @wheel="onWheel"
  >
    <!-- 控制栏 -->
    <div class="control-bar" :class="{ visible: isHovered }">
      <button class="ctrl-btn drag-handle" @mousedown.stop="onDragStart" title="拖动">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/>
          <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
          <circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/>
        </svg>
      </button>
      <button class="ctrl-btn" @click="zoomOut" title="缩小字体">A-</button>
      <span class="font-size-label">{{ fontSize }}px</span>
      <button class="ctrl-btn" @click="zoomIn" title="放大字体">A+</button>
      <button class="ctrl-btn close-btn" @click="closeLyric" title="关闭歌词">✕</button>
    </div>

    <!-- 歌词 -->
    <div class="lyric-content" @mousedown="onDragStart">
      <p v-if="currentLyric" class="lyric-line current" :style="{ fontSize: fontSize + 'px' }">
        {{ currentLyric }}
      </p>
      <p v-if="nextLyric" class="lyric-line next" :style="{ fontSize: (fontSize - 4) + 'px' }">
        {{ nextLyric }}
      </p>
      <p v-if="!currentLyric && !nextLyric && songName" class="lyric-line empty" :style="{ fontSize: fontSize + 'px' }">
        {{ songName }} - {{ artistName }}
      </p>
      <p v-if="!currentLyric && !nextLyric && !songName" class="lyric-line empty" :style="{ fontSize: fontSize + 'px' }">
        等待播放...
      </p>
    </div>
  </div>
</template>

<style scoped>
.desktop-lyric-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: default;
}

.control-bar {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 8px 8px;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 10;
}
.control-bar.visible { opacity: 1; }

.ctrl-btn {
  width: 24px; height: 24px;
  border: none; border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.ctrl-btn:hover { background: rgba(255, 255, 255, 0.2); }
.drag-handle { cursor: grab; }
.drag-handle:active { cursor: grabbing; }
.close-btn { color: rgba(255, 100, 100, 0.9); }
.close-btn:hover { background: rgba(255, 100, 100, 0.3); }
.font-size-label { color: rgba(255, 255, 255, 0.5); font-size: 10px; min-width: 32px; text-align: center; }

.lyric-content {
  text-align: center;
  padding: 8px 20px;
  cursor: grab;
  width: 100%;
}
.lyric-content:active { cursor: grabbing; }

.lyric-line {
  margin: 0; line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  transition: font-size 0.2s ease;
}
.lyric-line.current { color: #4cd964; font-weight: 700; }
.lyric-line.next { color: rgba(255, 255, 255, 0.6); font-weight: 400; margin-top: 4px; }
.lyric-line.empty { color: rgba(255, 255, 255, 0.5); font-weight: 400; }
</style>
