<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { searchSongs, getRankSongs, getRankNames, formatDuration, type Song } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import Pagination from '@/components/Pagination.vue'

const store = usePlayerStore()

const rankNames = getRankNames()
const currentRank = ref(rankNames[0] || '')
const allSongs = ref<Song[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20

const displaySongs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allSongs.value.slice(start, start + pageSize)
})

async function loadRank() {
  if (!currentRank.value) return
  loading.value = true
  try {
    allSongs.value = await getRankSongs(currentRank.value)
  } catch (e) {
    console.error('加载排行榜失败:', e)
  } finally {
    loading.value = false
  }
}

function playAll() {
  if (allSongs.value.length) store.playAll(allSongs.value)
}

watch(currentRank, () => {
  currentPage.value = 1
  loadRank()
})
onMounted(loadRank)
</script>

<template>
  <div class="rank-view">
    <!-- header -->
    <div class="view-header">
      <div>
        <h1 class="section-title">排行榜</h1>
        <p class="view-subtitle">实时更新热门音乐排行</p>
      </div>
      <button class="btn-accent" @click="playAll">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        播放全部
      </button>
    </div>

    <!-- tabs -->
    <div class="tab-bar" style="margin-bottom: 20px;">
      <button
        v-for="name in rankNames"
        :key="name"
        class="tab-item"
        :class="{ active: currentRank === name }"
        @click="currentRank = name"
      >{{ name }}</button>
    </div>

    <!-- loading -->
    <div v-if="loading" class="empty-state">
      <div class="spinner"></div>
    </div>

    <!-- song list -->
    <template v-else-if="allSongs.length">
      <div class="card song-list">
        <div
          v-for="(song, i) in displaySongs"
          :key="song.id"
          class="song-row"
          @click="store.play(song)"
        >
          <span class="song-index" :class="{ top: (currentPage - 1) * pageSize + i < 3 }">{{ (currentPage - 1) * pageSize + i + 1 }}</span>
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
        </div>
      </div>
      <Pagination
        :total="allSongs.length"
        :page-size="pageSize"
        :current="currentPage"
        @update:current="currentPage = $event"
      />
    </template>

    <!-- empty -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <span class="empty-title">暂无排行榜数据</span>
    </div>
  </div>
</template>

<style scoped>
.rank-view {
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
.song-list {
  padding: 4px 0;
}
</style>
