<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { getLyric } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import { findCurrentLine, parseLrc, type LyricLine } from '@/utils/lyricParser'

const playerStore = usePlayerStore()
const { currentSong, currentTime } = storeToRefs(playerStore)

const lyricContainer = ref<HTMLElement | null>(null)
const lyricLines = ref<LyricLine[]>([])
const isLoading = ref(false)
const currentLineIndex = computed(() => findCurrentLine(lyricLines.value, currentTime.value))

watch(
  () => currentSong.value?.id,
  async (songId, _, onCleanup) => {
    let cancelled = false
    onCleanup(() => { cancelled = true })

    lyricLines.value = []
    if (!songId) return

    isLoading.value = true
    const lrcText = await getLyric(songId)
    if (!cancelled) {
      lyricLines.value = parseLrc(lrcText)
      isLoading.value = false
    }
  },
  { immediate: true },
)

watch(currentLineIndex, async (index) => {
  if (index < 0) return
  await nextTick()
  const currentLine = lyricContainer.value?.querySelector<HTMLElement>(`[data-line-index="${index}"]`)
  currentLine?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})
</script>

<template>
  <section class="lyric-panel">
    <div class="lyric-header">歌词</div>
    <div ref="lyricContainer" class="lyric-content">
      <div v-if="isLoading" class="lyric-state">
        <div class="spinner"></div>
      </div>
      <div v-else-if="!lyricLines.length" class="lyric-state">暂无歌词</div>
      <div v-else class="lyric-lines">
        <p
          v-for="(line, index) in lyricLines"
          :key="`${line.time}-${index}`"
          :data-line-index="index"
          class="lyric-line"
          :class="{ active: index === currentLineIndex }"
        >
          {{ line.text }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lyric-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
}

.lyric-header {
  flex-shrink: 0;
  padding: 20px 24px 14px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.lyric-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.lyric-lines {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
}

.lyric-line {
  margin: 0 0 16px;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.55;
  transition: color 0.25s ease, font-size 0.25s ease, font-weight 0.25s ease;
}

.lyric-line.active {
  color: var(--accent);
  font-size: 18px;
  font-weight: 600;
}

.lyric-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: var(--text-muted);
  font-size: 14px;
}

.lyric-state .spinner {
  width: 28px;
  height: 28px;
}
</style>
